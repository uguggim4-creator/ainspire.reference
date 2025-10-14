import { useState, useCallback, useEffect, useRef } from 'react';
import type { ExtractedFrame } from '../types';

export const useVideoProcessor = (frameCaptureIntervalS: number) => {
    const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingQueue, setProcessingQueue] = useState<File[]>([]);
    const [currentVideo, setCurrentVideo] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const currentVideoUrlRef = useRef<string | null>(null);

    const addVideosToQueue = useCallback((videoFiles: File[]) => {
        setProcessingQueue(prev => [...prev, ...videoFiles]);
    }, []);

    const stopProcessing = useCallback(() => {
        if (videoRef.current && currentVideoUrlRef.current) {
            URL.revokeObjectURL(currentVideoUrlRef.current);
            videoRef.current.removeAttribute('src'); // Use removeAttribute
            videoRef.current.load();
            videoRef.current = null;
            currentVideoUrlRef.current = null;
        }
        setProcessingQueue([]);
        setIsProcessing(false);
        setCurrentVideo(null);
        setExtractedFrames([]);
    }, []);

    const processVideoInternal = useCallback(async (videoFile: File) => {
        return new Promise<ExtractedFrame[]>((resolve) => {
            const video = document.createElement('video');
            videoRef.current = video;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const videoUrl = URL.createObjectURL(videoFile);
            currentVideoUrlRef.current = videoUrl;
            
            video.muted = true;
            video.playsInline = true;

            const frames: ExtractedFrame[] = [];
            let captureFrameHandler: (() => void) | null = null;

            const cleanupAndResolve = (resultFrames: ExtractedFrame[]) => {
                if (captureFrameHandler) {
                    video.removeEventListener('seeked', captureFrameHandler);
                }
                video.removeEventListener('loadedmetadata', onMetadataLoaded);
                video.removeEventListener('error', onError);
                URL.revokeObjectURL(videoUrl);
                if (videoRef.current === video) videoRef.current = null;
                if (currentVideoUrlRef.current === videoUrl) currentVideoUrlRef.current = null;
                resolve(resultFrames);
            };

            const onMetadataLoaded = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                let currentTime = 0;
                const duration = video.duration;

                captureFrameHandler = () => {
                    if (!context) return;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    frames.push({ data: dataUrl, timestamp: video.currentTime, sourceName: videoFile.name });

                    currentTime += frameCaptureIntervalS;
                    if (currentTime < duration) {
                        video.currentTime = currentTime;
                    } else {
                        cleanupAndResolve(frames);
                    }
                };

                video.addEventListener('seeked', captureFrameHandler);
                video.currentTime = 0; // Start seeking
            };

            const onError = () => {
                console.error("Error processing video or processing was stopped:", videoFile.name);
                cleanupAndResolve([]);
            };

            video.addEventListener('loadedmetadata', onMetadataLoaded);
            video.addEventListener('error', onError);

            video.src = videoUrl;
            video.load();
        });
    }, [frameCaptureIntervalS]);

    useEffect(() => {
        if (isProcessing || processingQueue.length === 0) {
            return;
        }

        const nextVideo = processingQueue[0];
        
        setCurrentVideo(nextVideo);
        setIsProcessing(true);
        setExtractedFrames([]);
        
        processVideoInternal(nextVideo).then(frames => {
            // If stopProcessing was called, isProcessing will be false.
            // This check prevents state updates after cancellation.
            if (isProcessing) {
                setExtractedFrames(frames);
                setProcessingQueue(prev => prev.slice(1));
                setIsProcessing(false);
                setCurrentVideo(null);
            }
        });

    }, [isProcessing, processingQueue, processVideoInternal]);

    return { 
        extractedFrames, 
        addVideosToQueue, 
        isProcessing,
        currentVideo,
        processingQueue,
        stopProcessing,
    };
};