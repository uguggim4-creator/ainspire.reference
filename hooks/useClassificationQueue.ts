import { useState, useCallback, useEffect } from 'react';
import { classifyImage } from '../services/geminiService';
import type { ExtractedFrame, ReferenceImage } from '../types';

export const useClassificationQueue = () => {
    const [queue, setQueue] = useState<ExtractedFrame[]>([]);
    const [classifiedImages, setClassifiedImages] = useState<ReferenceImage[]>([]);
    const [isClassifying, setIsClassifying] = useState<boolean>(false);
    const [currentClassification, setCurrentClassification] = useState<ExtractedFrame | null>(null);

    const addFramesToQueue = useCallback((frames: ExtractedFrame[]) => {
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
            } catch (error) {
                console.error("Failed to process frame:", error);
            } finally {
                setQueue(prev => prev.slice(1));
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
    };
};
