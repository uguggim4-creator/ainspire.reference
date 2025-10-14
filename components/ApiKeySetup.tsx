import React, { useState } from 'react';
import { useTranslation } from '../i18n/i18n';

interface ApiKeySetupProps {
    onSubmit: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSubmit }) => {
    const [key, setKey] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSubmit(key.trim());
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-950 p-8 rounded-xl shadow-2xl border border-gray-800 text-center">
                <h1 className="text-3xl font-bold text-amber-400">
                    AINSPIRE
                </h1>
                <p className="text-gray-400 mt-2 mb-8">{t('apiKeySetup.title')}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder={t('apiKeySetup.placeholder')}
                        aria-label="Gemini API Key"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!key.trim()}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-md transition-colors duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                        {t('apiKeySetup.continue')}
                    </button>
                </form>

                <div className="mt-6">
                    <p className="text-sm text-gray-500">
                        {t('apiKeySetup.getApiKey')}{' '}
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-amber-400 hover:underline"
                        >
                            Google AI Studio
                        </a>
                        .
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                        {t('apiKeySetup.storageInfo')}
                    </p>
                </div>
            </div>
        </div>
    );
};