import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FilterSidebar } from './components/FilterSidebar';
import { Gallery } from './components/Gallery';
import { Header } from './components/Header';
import { Uploader } from './components/Uploader';
import { useVideoProcessor } from './hooks/useVideoProcessor';
import { useClassificationQueue } from './hooks/useClassificationQueue';
import type { ReferenceImage, FilterOptions, ActiveFilters, ExtractedFrame } from './types';
import { Loader } from './components/Loader';
import { ApiKeySetup } from './components/ApiKeySetup';
import { initializeGeminiClient } from './services/geminiService';
import { useTranslation } from './i18n/i18n';

const App: React.FC = () => {
    const { t } = useTranslation();
    const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
    const [captureInterval, setCaptureInterval] = useState(3);
    const [searchQuery, setSearchQuery] = useState('');
    const [allImages, setAllImages] = useState<ReferenceImage[]>([]);

    const handleClassificationComplete = useCallback((classifiedImage: ReferenceImage) => {
        setAllImages(prevImages =>
            prevImages.map(img =>
                img.id === classifiedImage.id ? classifiedImage : img
            )
        );
    }, []);

    const {
        addClassificationJobs,
        isClassifying,
        queueSize: classificationQueueSize,
        currentClassification,
        apiError
    } = useClassificationQueue(handleClassificationComplete);

    const handleFrameExtracted = useCallback((frame: ExtractedFrame) => {
        const newImage: ReferenceImage = {
            id: crypto.randomUUID(),
            src: frame.data,
            classifications: {}, // Initially empty
            timestamp: frame.timestamp,
            sourceName: frame.sourceName,
        };
        setAllImages(prev => [...prev, newImage]);
        addClassificationJobs([{ id: newImage.id, src: newImage.src, timestamp: newImage.timestamp, sourceName: newImage.sourceName }]);
    }, [addClassificationJobs]);

    const {
        addVideosToQueue,
        isProcessing: isExtracting,
        currentVideo,
        processingQueue: videoQueue,
        stopProcessing
    } = useVideoProcessor(captureInterval, handleFrameExtracted);

    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (apiKey) {
            initializeGeminiClient(apiKey);
            localStorage.setItem('gemini-api-key', apiKey);
        } else {
            localStorage.removeItem('gemini-api-key');
        }
    }, [apiKey]);

    useEffect(() => {
        if (apiError) {
            alert(t('alerts.invalidApiKey'));
            setApiKey(null);
        }
    }, [apiError, t]);

    const handleFiles = (files: FileList) => {
        const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));
        if (videoFiles.length > 0) {
            addVideosToQueue(videoFiles);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const handleRemoveImage = (id: string) => {
        setAllImages(prev => prev.filter(image => image.id !== id));
    };

    const filterOptions: FilterOptions = useMemo(() => {
        const options: FilterOptions = {};
        allImages.forEach(image => {
            for (const [key, value] of Object.entries(image.classifications)) {
                if (typeof value === 'string' && value) {
                    const category = key as keyof FilterOptions;
                    if (!options[category]) {
                        options[category] = [];
                    }
                    if (!options[category]?.includes(value)) {
                        options[category]?.push(value);
                    }
                }
            }
        });
        Object.values(options).forEach(v => v?.sort());
        return options;
    }, [allImages]);

    const filteredImages = useMemo(() => {
        let images = allImages;

        // Apply category filters first
        if (Object.keys(activeFilters).length > 0) {
            images = images.filter(image => {
                return Object.entries(activeFilters).every(([key, value]) => {
                    const category = key as keyof typeof image.classifications;
                    return image.classifications[category] === value;
                });
            });
        }

        // Then apply search query on the result
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            images = images.filter(image => {
                // Check against source name
                if (image.sourceName.toLowerCase().includes(lowercasedQuery)) {
                    return true;
                }
                // Check against all classification values
                return Object.values(image.classifications).some(
                    value => typeof value === 'string' && value.toLowerCase().includes(lowercasedQuery)
                );
            });
        }

        return images;
    }, [allImages, activeFilters, searchQuery]);

    const handleExport = useCallback(() => {
        const jsonString = JSON.stringify(allImages, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ainspire-collection.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [allImages]);

    const handleImport = useCallback((jsonString: string) => {
        try {
            const importedImages: ReferenceImage[] = JSON.parse(jsonString);
            if (Array.isArray(importedImages) && importedImages.every(img => 'id' in img && 'src' in img && 'classifications' in img)) {
                setAllImages(importedImages);
            } else {
                alert(t('alerts.invalidJson'));
            }
        } catch (error) {
            console.error("Error importing JSON:", error);
            alert(t('alerts.jsonParseError'));
        }
    }, [t]);

    const handleApiKeySubmit = (key: string) => {
        setApiKey(key);
    };

    const handleClearApiKey = () => {
        setApiKey(null);
    }

    const showUploader = allImages.length === 0 && !isExtracting && !isClassifying && videoQueue.length === 0;

    const getStatusMessage = () => {
        if (isExtracting && currentVideo) {
            return t('status.extracting', { videoName: currentVideo.name, queueLength: videoQueue.length });
        }
        if (isClassifying && currentClassification) {
            return t('status.classifying', { sourceName: currentClassification.sourceName, queueSize: classificationQueueSize });
        }
        return null;
    }

    return (
        <div className="bg-gray-900 text-white h-full rounded-xl shadow-2xl flex overflow-hidden border border-gray-700 animate-pop-in">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="video/*"
            />
            <FilterSidebar
                options={filterOptions}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
                onImport={handleImport}
                onExport={handleExport}
                captureInterval={captureInterval}
                onIntervalChange={setCaptureInterval}
                onChangeApiKey={handleClearApiKey}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                {!apiKey ? (
                    <ApiKeySetup onSubmit={handleApiKeySubmit} />
                ) : (
                    <>
                        <Header
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onAddVideoClick={handleUploadClick}
                        />
                        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                            {showUploader ? (
                                <Uploader onFiles={handleFiles} onUploadClick={handleUploadClick} />
                            ) : (
                                <>
                                    {getStatusMessage() && (
                                        <div className="flex items-center justify-center space-x-3 bg-gray-800 p-4 rounded-lg mb-6">
                                            <Loader />
                                            <p className="text-gray-300">{getStatusMessage()}</p>
                                            {isExtracting && (
                                                <button
                                                    onClick={stopProcessing}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-md text-sm transition-colors"
                                                    aria-label="Stop video processing"
                                                >
                                                    {t('status.stop')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <Gallery images={filteredImages} onRemove={handleRemoveImage} />
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default App;