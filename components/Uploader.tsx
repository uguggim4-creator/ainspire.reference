import React, { useCallback, useState } from 'react';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface UploaderProps {
  onFiles: (files: FileList) => void;
  onUploadClick: () => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onFiles, onUploadClick }) => {
  const [isDragging, setIsDragging] = useState(false);

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
            <h2 className="text-2xl font-bold mb-2 text-white">비디오 파일을 드래그 & 드롭하세요</h2>
            <p className="text-gray-400 mb-6">또는 클릭해서 파일을 선택하세요</p>
            <button
              onClick={onUploadClick}
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300"
            >
              파일 선택
            </button>
        </div>
      </div>
      <div className="mt-8 text-center max-w-lg p-4 bg-gray-800 rounded-lg flex items-start space-x-3">
        <InformationCircleIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
        <div>
            <h3 className="text-lg font-semibold text-white text-left">사용법</h3>
            <p className="text-gray-400 mt-1 text-left">
                이 도구는 비디오에서 주요 프레임을 추출하고 AI를 사용하여 구도, 동작, 조명 등을 기준으로 자동 분류합니다. 이를 통해 창작 프로젝트를 위한 검색 가능한 레퍼런스 라이브러리를 빠르게 구축할 수 있습니다.
            </p>
        </div>
      </div>
    </div>
  );
};