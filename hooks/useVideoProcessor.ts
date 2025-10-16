import { useState, useCallback, useEffect, useRef } from 'react';
import type { ExtractedFrame } from '../types';

export const useVideoProcessor = (
    frameCaptureIntervalS: number,
    onFrameExtracted: (frame: ExtractedFrame) => void
) => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processingQueue, setProcessingQueue] = useState<File[]>([]);
    const [currentVideo, setCurrentVideo] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const currentVideoUrlRef = useRef<string | null>(null);
    const stopFlag = useRef(false);

    const addVideosToQueue = useCallback((videoFiles: File[]) => {
        setProcessingQueue(prev => [...prev, ...videoFiles]);
    }, []);

    const stopProcessing = useCallback(() => {
        stopFlag.current = true;
        if (videoRef.current) {
            // Remove src to trigger the 'error' event in processVideoInternal,
            // which handles the cleanup.
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
        }
        setProcessingQueue([]);
        setIsProcessing(false);
        setCurrentVideo(null);
    }, []);
    
    const processVideoInternal = useCallback(async (videoFile: File) => {
        return new Promise<void>((resolve) => {
            const video = document.createElement('video');
            videoRef.current = video;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const videoUrl = URL.createObjectURL(videoFile);
            currentVideoUrlRef.current = videoUrl;
            
            video.muted = true;
            video.playsInline = true;

            let captureFrameHandler: (() => void) | null = null;

            const cleanupAndResolve = () => {
                if (captureFrameHandler) {
                    video.removeEventListener('seeked', captureFrameHandler);
                }
                video.removeEventListener('loadedmetadata', onMetadataLoaded);
                video.removeEventListener('error', onError);
                URL.revokeObjectURL(videoUrl);
                if (videoRef.current === video) videoRef.current = null;
                if (currentVideoUrlRef.current === videoUrl) currentVideoUrlRef.current = null;
                resolve();
            };

            const onMetadataLoaded = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                let currentTime = 0;
                const duration = video.duration;

                captureFrameHandler = () => {
                    if (stopFlag.current || !context) {
                        cleanupAndResolve();
                        return;
                    }
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    
                    onFrameExtracted({ data: dataUrl, timestamp: video.currentTime, sourceName: videoFile.name });

                    currentTime += frameCaptureIntervalS;
                    if (currentTime < duration) {
                        video.currentTime = currentTime;
                    } else {
                        cleanupAndResolve();
                    }
                };

                video.addEventListener('seeked', captureFrameHandler);
                video.currentTime = 0; // Start seeking
            };

            const onError = () => {
                console.error("Error processing video or processing was stopped:", videoFile.name);
                cleanupAndResolve();
            };

            video.addEventListener('loadedmetadata', onMetadataLoaded);
            video.addEventListener('error', onError);

            video.src = videoUrl;
            video.load();
        });
    }, [frameCaptureIntervalS, onFrameExtracted]);

    useEffect(() => {
        if (isProcessing || processingQueue.length === 0) {
            return;
        }

        const nextVideo = processingQueue[0];
        
        stopFlag.current = false;
        setCurrentVideo(nextVideo);
        setIsProcessing(true);
        
        processVideoInternal(nextVideo).then(() => {
            // Check stopFlag because processing might have been stopped
            // while the promise was running.
            if (!stopFlag.current) {
                setProcessingQueue(prev => prev.slice(1));
                setIsProcessing(false);
                setCurrentVideo(null);
            }
        });

    }, [isProcessing, processingQueue, processVideoInternal]);

    // Cleanup effect for when the component unmounts
    useEffect(() => {
        return () => {
            if (currentVideoUrlRef.current) {
                URL.revokeObjectURL(currentVideoUrlRef.current);
            }
        };
    }, []);

    return { 
        addVideosToQueue, 
        isProcessing,
        currentVideo,
        processingQueue,
        stopProcessing,
    };
};