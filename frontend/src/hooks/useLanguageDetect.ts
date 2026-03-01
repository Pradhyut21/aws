import { useState, useEffect } from 'react';
import { INDIAN_LANGUAGES } from '../lib/constants';

interface DetectionResult {
    detected: boolean;
    languageCode: string;
    languageName: string;
    confidence: number;
}

const SCRIPT_RANGES: Array<{ range: RegExp; code: string }> = [
    { range: /[\u0900-\u097F]/, code: 'hi' },  // Devanagari (Hindi/Marathi/Sanskrit)
    { range: /[\u0980-\u09FF]/, code: 'bn' },  // Bengali
    { range: /[\u0A00-\u0A7F]/, code: 'pa' },  // Gurmukhi (Punjabi)
    { range: /[\u0A80-\u0AFF]/, code: 'gu' },  // Gujarati
    { range: /[\u0B00-\u0B7F]/, code: 'or' },  // Odia
    { range: /[\u0B80-\u0BFF]/, code: 'ta' },  // Tamil
    { range: /[\u0C00-\u0C7F]/, code: 'te' },  // Telugu
    { range: /[\u0C80-\u0CFF]/, code: 'kn' },  // Kannada
    { range: /[\u0D00-\u0D7F]/, code: 'ml' },  // Malayalam
    { range: /[\u0600-\u06FF]/, code: 'ur' },  // Arabic/Urdu
];

export function useLanguageDetect(text: string) {
    const [result, setResult] = useState<DetectionResult>({
        detected: false,
        languageCode: '',
        languageName: '',
        confidence: 0,
    });

    useEffect(() => {
        if (!text || text.trim().length < 3) {
            setResult({ detected: false, languageCode: '', languageName: '', confidence: 0 });
            return;
        }

        for (const { range, code } of SCRIPT_RANGES) {
            if (range.test(text)) {
                const lang = INDIAN_LANGUAGES.find(l => l.code === code);
                setResult({
                    detected: true,
                    languageCode: code,
                    languageName: lang?.name || 'Hindi',
                    confidence: 0.92,
                });
                return;
            }
        }

        // Default: English detected
        setResult({ detected: true, languageCode: 'en', languageName: 'English', confidence: 0.85 });
    }, [text]);

    return result;
}
