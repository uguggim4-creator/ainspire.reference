import React, { useRef } from 'react';
import type { FilterOptions, ActiveFilters } from '../types';
import type { Classification } from '../types';
import { FolderArrowDownIcon } from './icons/FolderArrowDownIcon';
import { FolderArrowUpIcon } from './icons/FolderArrowUpIcon';
import { KeyIcon } from './icons/KeyIcon';
import { useTranslation } from '../i18n/i18n';


interface FilterSidebarProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<ActiveFilters>>;
  onImport: (jsonString: string) => void;
  onExport: () => void;
  captureInterval: number;
  onIntervalChange: React.Dispatch<React.SetStateAction<number>>;
  onChangeApiKey: () => void;
}

const CATEGORY_ORDER = ["composition", "action", "lighting", "color", "setting"] as const;

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ options, activeFilters, onFilterChange, onImport, onExport, captureInterval, onIntervalChange, onChangeApiKey }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language, setLanguage } = useTranslation();

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const text = e.target?.result;
              if (typeof text === 'string') {
                  onImport(text);
              }
          };
          reader.readAsText(file);
      }
  };

  const handleFilter = (category: keyof Classification, value: string | null) => {
    onFilterChange(prev => {
      const newFilters = { ...prev };
      if (value === null) {
        delete newFilters[category];
      } else {
        newFilters[category] = value;
      }
      return newFilters;
    });
  };

  const hasOptions = Object.keys(options).length > 0;

  return (
    <aside className="w-64 bg-gray-950 p-6 flex-shrink-0 flex flex-col justify-between h-full sticky top-0">
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="mb-10">
            <h1 className="text-2xl font-bold text-amber-400">
                {t('sidebar.title')}
            </h1>
            <p className="text-xs text-gray-400">{t('sidebar.subtitle')}</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('sidebar.filters')}</h2>
            {hasOptions && (
                <button
                    onClick={() => onFilterChange({})}
                    className="text-xs text-gray-400 hover:text-amber-400 transition-colors focus:outline-none"
                    aria-label="Reset all filters"
                >
                    {t('sidebar.reset')}
                </button>
            )}
        </div>

        {hasOptions ? (
           <div className="space-y-6">
           {CATEGORY_ORDER.map(category => (
             options[category] && (
               <div key={category}>
                 <h3 className="font-semibold text-gray-400 mb-3">{t(`categories.${category}`)}</h3>
                 <div className="flex flex-col space-y-1">
                  <button
                       onClick={() => handleFilter(category, null)}
                       className={`w-full text-left rounded-md transition-colors text-sm py-2 ${
                           !activeFilters[category]
                           ? 'bg-gray-800 text-white font-semibold border-l-4 border-amber-400 pl-3'
                           : 'text-gray-300 hover:bg-gray-800 pl-4'
                       }`}
                   >
                       {t('sidebar.all')}
                   </button>
                   {options[category]?.map(value => (
                     <button
                       key={value}
                       onClick={() => handleFilter(category, value)}
                       className={`w-full text-left rounded-md transition-colors text-sm py-2 ${
                           activeFilters[category] === value
                           ? 'bg-gray-800 text-white font-semibold border-l-4 border-amber-400 pl-3'
                           : 'text-gray-300 hover:bg-gray-800 pl-4'
                       }`}
                     >
                       {value}
                     </button>
                   ))}
                 </div>
               </div>
             )
           ))}
         </div>
        ) : (
          <p className="text-gray-500 text-sm">{t('sidebar.noFilters')}</p>
        )}
      </div>
      <div className="flex-shrink-0 pt-6">
        <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('sidebar.language')}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full font-semibold py-2 rounded-md transition-colors ${language === 'en' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ko')}
                className={`w-full font-semibold py-2 rounded-md transition-colors ${language === 'ko' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                KO
              </button>
            </div>
        </div>
        <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('sidebar.settings')}</h2>
            <div className="space-y-2">
                <label htmlFor="interval-input" className="text-sm text-gray-300 block">{t('sidebar.captureInterval')}</label>
                <input
                    id="interval-input"
                    type="number"
                    min="1"
                    max="30"
                    value={captureInterval}
                    onChange={(e) => onIntervalChange(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>
        </div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('sidebar.manage')}</h2>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
        />
        <div className="space-y-2">
            <button
                onClick={handleImportClick}
                className="w-full flex items-center space-x-3 text-gray-300 hover:bg-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
                <FolderArrowUpIcon className="w-5 h-5" />
                <span>{t('sidebar.import')}</span>
            </button>
            <button
                onClick={onExport}
                className="w-full flex items-center space-x-3 text-gray-300 hover:bg-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
                <FolderArrowDownIcon className="w-5 h-5" />
                <span>{t('sidebar.export')}</span>
            </button>
            <button
                onClick={onChangeApiKey}
                className="w-full flex items-center space-x-3 text-gray-300 hover:bg-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
                <KeyIcon className="w-5 h-5" />
                <span>{t('sidebar.changeApiKey')}</span>
            </button>
        </div>
      </div>
    </aside>
  );
};