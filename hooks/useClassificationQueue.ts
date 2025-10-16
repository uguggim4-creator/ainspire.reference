import { useState, useCallback, useEffect } from 'react';
import { classifyImage } from '../services/geminiService';
import type { ReferenceImage } from '../types';

interface ClassificationJob {
    id: string;
    src: string;
    timestamp: number;
    sourceName: string;
}

export const useClassificationQueue = (onClassificationComplete: (image: ReferenceImage) => void) => {
    const [queue, setQueue] = useState<ClassificationJob[]>([]);
    const [isClassifying, setIsClassifying] = useState<boolean>(false);
    const [currentClassification, setCurrentClassification] = useState<ClassificationJob | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const addClassificationJobs = useCallback((jobs: ClassificationJob[]) => {
        setApiError(null); // Clear previous errors when new jobs are added
        setQueue(prev => [...prev, ...jobs]);
    }, []);

    useEffect(() => {
        if (isClassifying || queue.length === 0) {
            return;
        }

        const processNextFrame = async () => {
            const jobToProcess = queue[0];
            setCurrentClassification(jobToProcess);
            setIsClassifying(true);

            try {
                const classifications = await classifyImage(jobToProcess.src);

                if (classifications) {
                    const classifiedImage: ReferenceImage = {
                        id: jobToProcess.id,
                        src: jobToProcess.src,
                        classifications,
                        timestamp: jobToProcess.timestamp,
                        sourceName: jobToProcess.sourceName,
                    };
                    onClassificationComplete(classifiedImage);
                }
                // On success or if classification returns null, remove from queue
                setQueue(prev => prev.slice(1));

            } catch (error) {
                console.error("Failed to process frame:", error);
                if (error instanceof Error && error.message.includes("Invalid API Key")) {
                    setApiError(error.message);
                    setQueue([]); // Stop the queue on API error
                } else {
                    // For other errors, skip the frame and continue
                    setQueue(prev => prev.slice(1));
                }
            } finally {
                setCurrentClassification(null);
                setIsClassifying(false);
            }
        };

        processNextFrame();

    }, [queue, isClassifying, onClassificationComplete]);

    return {
        addClassificationJobs,
        isClassifying,
        queueSize: queue.length,
        currentClassification,
        apiError,
    };
};
