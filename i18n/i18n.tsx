import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';

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

// Translation file cache
const translationsCache: { [key: string]: any } = {};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => {
        const savedLang = localStorage.getItem('ainspire-lang');
        if (savedLang) return savedLang;
        // Default to browser language if it's Korean, otherwise English
        return navigator.language.startsWith('ko') ? 'ko' : 'en';
    });
    
    const [translations, setTranslations] = useState<any>({});

    useEffect(() => {
        const loadTranslations = async () => {
            if (translationsCache[language]) {
                setTranslations(translationsCache[language]);
                return;
            }
            try {
                // Dynamically import the translation file
                const translationModule = await import(`./locales/${language}.json`);
                translationsCache[language] = translationModule.default;
                setTranslations(translationModule.default);
            } catch (error) {
                console.error(`Could not load translations for ${language}`, error);
                // Fallback to English if the language file is not found
                const fallbackModule = await import(`./locales/en.json`);
                translationsCache['en'] = fallbackModule.default;
                setTranslations(fallbackModule.default);
            }
        };

        loadTranslations();
    }, [language]);

    const setLanguage = (lang: string) => {
        localStorage.setItem('ainspire-lang', lang);
        setLanguageState(lang);
    };

    const t = useCallback((key: string, params?: { [key: string]: string | number }): string => {
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
    }, [translations]);

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
