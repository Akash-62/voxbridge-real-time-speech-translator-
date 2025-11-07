import React, { useState } from 'react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  id: string;
  label: string;
  selectedLanguage: Language | null;
  onLanguageChange: (language: Language) => void;
  languages: Language[];
  disabled: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  id,
  label,
  selectedLanguage,
  onLanguageChange,
  languages,
  disabled,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langCode = e.target.value;
    const language = languages.find(l => l.code === langCode);
    if (language) {
      onLanguageChange(language);
    }
  };

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label htmlFor={id} className="text-xs font-medium text-[#8696A0]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={selectedLanguage?.code || ''}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full bg-[#2A3942] border ${isFocused ? 'border-[#005C4B] shadow-lg shadow-[#005C4B]/20' : 'border-[#313D45]'} text-[#E9EDEF] rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#005C4B]/50 focus:ring-2 focus:ring-[#005C4B]/30 focus:outline-none appearance-none cursor-pointer`}
        >
          <option value="" disabled>Select language</option>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-[#2A3942]">
              {lang.name}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className={`w-4 h-4 text-[#8696A0] ${isFocused ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};