import React, { useEffect } from 'react';
import type { ReferenceImage } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface ModalProps {
  image: ReferenceImage;
  onClose: () => void;
}

const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
}


export const Modal: React.FC<ModalProps> = ({ image, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-1 p-4 flex items-center justify-center">
                    <img src={image.src} alt={image.sourceName} className="max-w-full max-h-[80vh] object-contain rounded-md" />
                </div>
                <div className="w-full md:w-64 bg-gray-950 p-6 flex-shrink-0 overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4 text-white">Details</h3>
                    <div className="space-y-3">
                        {Object.entries(image.classifications).map(([key, value]) => value && (
                            <div key={key}>
                                <p className="text-sm font-semibold text-gray-400">{formatCategoryName(key)}</p>
                                <p className="text-md text-white">{value}</p>
                            </div>
                        ))}
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Source</p>
                            <p className="text-md text-white break-words">{image.sourceName}</p>
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
                title="Close"
            >
                <XCircleIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};