import React, { useEffect } from 'react';
import type { ReferenceImage } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { useTranslation } from '../i18n/i18n';

interface ModalProps {
  image: ReferenceImage;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ image, onClose }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = image.src;
        const timestampStr = image.timestamp.toFixed(2).replace('.', '_');
        a.download = `${image.sourceName.replace(/\.[^/.]+$/, "")}-${timestampStr}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

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
                <div className="w-full md:w-64 bg-gray-950 p-6 flex flex-col flex-shrink-0 overflow-y-auto">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-4 text-white">{t('modal.details')}</h3>
                        <div className="space-y-3">
                            {Object.entries(image.classifications).map(([key, value]) => value && (
                                <div key={key}>
                                    <p className="text-sm font-semibold text-gray-400">{t(`categories.${key}`)}</p>
                                    <p className="text-md text-white">{value}</p>
                                </div>
                            ))}
                            <div>
                                <p className="text-sm font-semibold text-gray-400">{t('modal.source')}</p>
                                <p className="text-md text-white break-words">{image.sourceName}</p>
                            </div>
                        </div>
                    </div>
                     <button
                        onClick={handleDownload}
                        className="w-full mt-6 flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>{t('modal.download')}</span>
                    </button>
                </div>
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
                title={t('modal.close')}
            >
                <XCircleIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};