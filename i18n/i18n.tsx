import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

// Embed translations directly to avoid module resolution issues
const enTranslations = {
  "sidebar": {
    "title": "AINSPIRE",
    "subtitle": "Reference Collector",
    "filters": "Filters",
    "reset": "Reset",
    "all": "All",
    "noFilters": "Upload content to see available filters.",
    "settings": "Settings",
    "captureInterval": "Capture Interval (sec)",
    "manage": "Manage",
    "import": "Import",
    "export": "Export",
    "changeApiKey": "Change API Key",
    "language": "Language",
    "downloadAllImages": "Download All Images",
    "downloadingImages": "Zipping..."
  },
  "categories": {
    "composition": "Composition",
    "action": "Action",
    "lighting": "Lighting",
    "color": "Color",
    "setting": "Setting"
  },
  "header": {
    "searchPlaceholder": "Search references by source or classification...",
    "addVideo": "Add Video"
  },
  "uploader": {
    "dragDrop": "Drag & drop your video files",
    "browse": "or click to browse files",
    "browseButton": "Browse Files",
    "howItWorksTitle": "How it works",
    "howItWorksDescription": "This tool extracts key frames from your videos and uses AI to automatically classify them by composition, action, lighting, and more. This helps you quickly build a searchable reference library for your creative projects."
  },
  "gallery": {
    "remove": "Remove",
    "download": "Download"
  },
  "modal": {
    "details": "Details",
    "source": "Source",
    "close": "Close",
    "download": "Download Image"
  },
  "apiKeySetup": {
    "title": "Enter your Gemini API Key to get started.",
    "placeholder": "Enter your Gemini API Key",
    "continue": "Continue",
    "getApiKey": "You can get a free API key from",
    "storageInfo": "Your API key is stored securely in your browser and is never sent anywhere else."
  },
  "status": {
    "extracting": "Extracting frames from {{videoName}}... ({{queueLength}} more video(s) in queue)",
    "classifying": "Classifying frame from {{sourceName}} ({{queueSize}} more frame(s) in queue)...",
    "stop": "Stop"
  },
  "alerts": {
    "invalidApiKey": "Invalid API Key. Please check your key and try again.",
    "invalidJson": "Invalid JSON file format.",
    "jsonParseError": "Failed to parse JSON file.",
    "noImagesToDownload": "There are no images to download.",
    "zipError": "Failed to create zip file."
  }
};

const koTranslations = {
  "sidebar": {
    "title": "AINSPIRE",
    "subtitle": "레퍼런스 수집",
    "filters": "필터",
    "reset": "초기화",
    "all": "전체",
    "noFilters": "필터를 보려면 콘텐츠를 업로드하세요.",
    "settings": "설정",
    "captureInterval": "캡처 간격 (초)",
    "manage": "관리",
    "import": "가져오기",
    "export": "내보내기",
    "changeApiKey": "API 키 변경",
    "language": "언어",
    "downloadAllImages": "모든 이미지 다운로드",
    "downloadingImages": "압축 중..."
  },
  "categories": {
    "composition": "구도",
    "action": "액션",
    "lighting": "조명",
    "color": "색상",
    "setting": "배경"
  },
  "header": {
    "searchPlaceholder": "소스 또는 분류로 레퍼런스 검색...",
    "addVideo": "비디오 추가"
  },
  "uploader": {
    "dragDrop": "비디오 파일을 드래그 & 드롭하세요",
    "browse": "또는 클릭해서 파일을 선택하세요",
    "browseButton": "파일 선택",
    "howItWorksTitle": "사용법",
    "howItWorksDescription": "이 도구는 비디오에서 주요 프레임을 추출하고 AI를 사용하여 구도, 동작, 조명 등을 기준으로 자동 분류합니다. 이를 통해 창작 프로젝트를 위한 검색 가능한 레퍼런스 라이브러리를 빠르게 구축할 수 있습니다."
  },
  "gallery": {
    "remove": "제거",
    "download": "다운로드"
  },
  "modal": {
    "details": "세부 정보",
    "source": "소스",
    "close": "닫기",
    "download": "이미지 다운로드"
  },
  "apiKeySetup": {
    "title": "시작하려면 Gemini API 키를 입력하세요.",
    "placeholder": "Gemini API 키를 입력하세요",
    "continue": "계속",
    "getApiKey": "에서 무료 API 키를 받을 수 있습니다.",
    "storageInfo": "API 키는 브라우저에 안전하게 저장되며 다른 곳으로 전송되지 않습니다."
  },
  "status": {
    "extracting": "{{videoName}}에서 프레임 추출 중... (대기열에 {{queueLength}}개의 비디오 남음)",
    "classifying": "{{sourceName}}의 프레임 분류 중... (대기열에 {{queueSize}}개의 프레임 남음)",
    "stop": "중지"
  },
  "alerts": {
    "invalidApiKey": "잘못된 API 키입니다. 키를 확인하고 다시 시도하세요.",
    "invalidJson": "잘못된 JSON 파일 형식입니다.",
    "jsonParseError": "JSON 파일 분석에 실패했습니다.",
    "noImagesToDownload": "다운로드할 이미지가 없습니다.",
    "zipError": "ZIP 파일 생성에 실패했습니다."
  }
};

// Translation map
const translationsMap: { [key: string]: any } = {
    en: enTranslations,
    ko: koTranslations,
};


// Define the shape of the context
interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, params?: { [key: string]: string | number }) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define props for the provider
interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => {
        const savedLang = localStorage.getItem('ainspire-lang');
        if (savedLang && translationsMap[savedLang]) return savedLang;
        // Default to browser language if it's Korean, otherwise English
        return navigator.language.startsWith('ko') ? 'ko' : 'en';
    });

    const setLanguage = (lang: string) => {
        localStorage.setItem('ainspire-lang', lang);
        setLanguageState(lang);
    };

    const t = useCallback((key: string, params?: { [key: string]: string | number }): string => {
        const translations = translationsMap[language] || translationsMap['en'];
        const keys = key.split('.');
        let result = keys.reduce((acc, currentKey) => acc && acc[currentKey], translations);

        if (typeof result !== 'string') {
            console.warn(`Translation key not found: ${key}`);
            return key; // Return the key itself as a fallback
        }
        
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
            });
        }

        return result;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to use the language context
export const useTranslation = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};