import { useState, useCallback, useEffect } from 'react';
import { classifyImage } from '../services/geminiService';
import type { ExtractedFrame, ReferenceImage } from '../types';

export const useClassificationQueue = () => {
    const [queue, setQueue] = useState<ExtractedFrame[]>([]);
    const [classifiedImages, setClassifiedImages] = useState<ReferenceImage[]>([]);
    const [isClassifying, setIsClassifying] = useState<boolean>(false);
    const [currentClassification, setCurrentClassification] = useState<ExtractedFrame | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const addFramesToQueue = useCallback((frames: ExtractedFrame[]) => {
        setApiError(null); // Clear previous errors when new frames are added
        setQueue(prev => [...prev, ...frames]);
    }, []);

    useEffect(() => {
        if (isClassifying || queue.length === 0) {
            return;
        }

        const processNextFrame = async () => {
            const frameToProcess = queue[0];
            setCurrentClassification(frameToProcess);
            setIsClassifying(true);

            try {
                const classifications = await classifyImage(frameToProcess.data);

                if (classifications) {
                    const newImage: ReferenceImage = {
                        id: crypto.randomUUID(),
                        src: frameToProcess.data,
                        classifications,
                        timestamp: frameToProcess.timestamp,
                        sourceName: frameToProcess.sourceName,
                    };
                    setClassifiedImages(prev => [...prev, newImage]);
                }
                 // Successfully processed, remove from queue
                setQueue(prev => prev.slice(1));

            } catch (error) {
                console.error("Failed to process frame:", error);
                if (error instanceof Error && error.message.includes("Invalid API Key")) {
                    setApiError(error.message);
                    // Stop the queue on API error
                    setQueue([]);
                }
            } finally {
                setCurrentClassification(null);
                setIsClassifying(false);
            }
        };

        processNextFrame();

    }, [queue, isClassifying]);

    return {
        addFramesToQueue,
        classifiedImages,
        isClassifying,
        queueSize: queue.length,
        currentClassification,
        setClassifiedImages,
        apiError,
    };
};