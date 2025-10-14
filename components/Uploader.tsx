import React, { useCallback, useState } from 'react';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { useTranslation } from '../i18n/i18n';

interface UploaderProps {
  onFiles: (files: FileList) => void;
  onUploadClick: () => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onFiles, onUploadClick }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files);
    }
  }, [onFiles]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-2xl border-4 border-dashed rounded-xl p-12 text-center transition-colors duration-300 ${
          isDragging ? 'border-amber-400 bg-gray-800' : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <h2 className="text-2xl font-bold mb-2 text-white">{t('uploader.dragDrop')}</h2>
            <p className="text-gray-400 mb-6">{t('uploader.browse')}</p>
            <button
              onClick={onUploadClick}
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300"
            >
              {t('uploader.browseButton')}
            </button>
        </div>
      </div>
      <div className="mt-8 text-center max-w-lg p-4 bg-gray-800 rounded-lg flex items-start space-x-3">
        <InformationCircleIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
        <div>
            <h3 className="text-lg font-semibold text-white text-left">{t('uploader.howItWorksTitle')}</h3>
            <p className="text-gray-400 mt-1 text-left">
                {t('uploader.howItWorksDescription')}
            </p>
        </div>
      </div>
    </div>
  );
};