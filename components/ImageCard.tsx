import React from 'react';
import type { ReferenceImage } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { useTranslation } from '../i18n/i18n';

interface ImageCardProps {
  image: ReferenceImage;
  onClick: () => void;
  onRemove: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, onRemove }) => {
  const { t } = useTranslation();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(image.id);
  };

  return (
    <div className="group relative aspect-video overflow-hidden rounded-lg bg-gray-800 cursor-pointer" onClick={onClick}>
      <img src={image.src} alt={image.sourceName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-3">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {Object.entries(image.classifications).map(([key, value]) => value && (
            <div key={key} className="text-xs">
              <span className="font-bold text-gray-300">{t(`categories.${key}`)}:</span> <span className="text-white">{value}</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2 truncate" title={image.sourceName}>{image.sourceName}</p>
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500"
        title={t('gallery.remove')}
      >
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};