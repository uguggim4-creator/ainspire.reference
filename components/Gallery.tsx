
import React, { useState } from 'react';
import { ImageCard } from './ImageCard';
import { Modal } from './Modal';
import type { ReferenceImage } from '../types';

interface GalleryProps {
  images: ReferenceImage[];
  onRemove: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onRemove }) => {
  const [selectedImage, setSelectedImage] = useState<ReferenceImage | null>(null);

  const handleImageClick = (image: ReferenceImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => handleImageClick(image)}
            onRemove={onRemove}
          />
        ))}
      </div>
      {selectedImage && <Modal image={selectedImage} onClose={handleCloseModal} />}
    </>
  );
};
