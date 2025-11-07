/**
 * 🎵 Kannada Voice Selector - Choose your preferred voice for Kannada
 */

import React, { useState, useEffect } from 'react';

interface KannadaVoice {
  voice: SpeechSynthesisVoice;
  displayName: string;
  description: string;
  quality: 'Premium' | 'Good' | 'Basic';
  accent: string;
}

interface KannadaVoiceSelectorProps {
  onVoiceSelect: (voice: SpeechSynthesisVoice | null) => void;
  currentVoice: SpeechSynthesisVoice | null;
}

export const KannadaVoiceSelector: React.FC<KannadaVoiceSelectorProps> = ({
  onVoiceSelect,
  currentVoice
}) => {
  const [availableVoices, setAvailableVoices] = useState<KannadaVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('auto');
  const [isTestSpeaking, setIsTestSpeaking] = useState(false);

  // Test phrase in Kannada
  const testPhrase = "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಾ? ಇದು ಕನ್ನಡ ಧ್ವನಿ ಪರೀಕ್ಷೆ ಅಲ್ಲ.";

  useEffect(() => {
    loadKannadaVoices();
    
    // Load voices when they become available
    speechSynthesis.addEventListener('voiceschanged', loadKannadaVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadKannadaVoices);
    };
  }, []);

  const loadKannadaVoices = () => {
    const allVoices = speechSynthesis.getVoices();
    const kannadaCompatibleVoices: KannadaVoice[] = [];

    // 🌟 PREMIUM KANNADA VOICES
    const premiumVoices = allVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      
      return (
        // Direct Kannada support
        name.includes('kannada') || lang.includes('kn') ||
        // Premium Indian voices that work well for Kannada
        name.includes('heera') || name.includes('kalpana') ||
        name.includes('ravi') || name.includes('priya') ||
        // South Indian language family
        (lang.includes('ta-in') || lang.includes('te-in') || lang.includes('ml-in'))
      );
    });

    premiumVoices.forEach(voice => {
      const name = voice.name.toLowerCase();
      let displayName = voice.name;
      let description = '';
      let quality: 'Premium' | 'Good' | 'Basic' = 'Good';
      let accent = 'Indian';

      if (name.includes('kannada') || voice.lang.includes('kn')) {
        displayName = '🌟 ' + voice.name + ' (Native Kannada)';
        description = 'Direct Kannada language support';
        quality = 'Premium';
        accent = 'Karnataka Native';
      } else if (name.includes('heera')) {
        displayName = '👑 Microsoft Heera (Recommended)';
        description = 'Premium Hindi voice - excellent for Kannada pronunciation';
        quality = 'Premium';
        accent = 'North Indian (Kannada Compatible)';
      } else if (name.includes('kalpana')) {
        displayName = '💎 Microsoft Kalpana';
        description = 'Premium Hindi female voice - clear Kannada pronunciation';
        quality = 'Premium';
        accent = 'Hindi Female';
      } else if (name.includes('ravi')) {
        displayName = '🎭 Ravi (Indian Male)';
        description = 'Natural Indian male voice';
        quality = 'Good';
        accent = 'Indian Male';
      } else if (name.includes('priya')) {
        displayName = '🌸 Priya (Indian Female)';
        description = 'Warm Indian female voice';
        quality = 'Good';
        accent = 'Indian Female';
      } else if (voice.lang.includes('ta-IN')) {
        displayName = '🏛️ ' + voice.name + ' (Tamil)';
        description = 'Tamil voice - similar phonetics to Kannada';
        quality = 'Good';
        accent = 'Tamil (South Indian)';
      } else if (voice.lang.includes('te-IN')) {
        displayName = '🏛️ ' + voice.name + ' (Telugu)';
        description = 'Telugu voice - Dravidian family like Kannada';
        quality = 'Good';
        accent = 'Telugu (South Indian)';
      } else if (voice.lang.includes('ml-IN')) {
        displayName = '🌴 ' + voice.name + ' (Malayalam)';
        description = 'Malayalam voice - South Indian accent';
        quality = 'Good';
        accent = 'Malayalam (South Indian)';
      }

      kannadaCompatibleVoices.push({
        voice,
        displayName,
        description,
        quality,
        accent
      });
    });

    // 🎯 GOOD QUALITY VOICES (Hindi and Indian English)
    const goodVoices = allVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      
      return (
        (lang.includes('hi-in') && !premiumVoices.includes(voice)) ||
        (lang.includes('en-in') && !premiumVoices.includes(voice)) ||
        (name.includes('indian') && !premiumVoices.includes(voice))
      );
    });

    goodVoices.forEach(voice => {
      const name = voice.name.toLowerCase();
      let displayName = '🎵 ' + voice.name;
      let description = 'Hindi voice - good for Kannada';
      let accent = 'Hindi';

      if (voice.lang.includes('en-in')) {
        description = 'Indian English accent - suitable for Kannada';
        accent = 'Indian English';
      }

      kannadaCompatibleVoices.push({
        voice,
        displayName,
        description,
        quality: 'Good',
        accent
      });
    });

    // 🔄 BASIC FALLBACK VOICES
    const fallbackVoices = allVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      
      return (
        (name.includes('zira') || name.includes('david') || name.includes('cortana')) &&
        !premiumVoices.includes(voice) && !goodVoices.includes(voice)
      );
    });

    fallbackVoices.forEach(voice => {
      kannadaCompatibleVoices.push({
        voice,
        displayName: '🔄 ' + voice.name + ' (Fallback)',
        description: 'System voice with Kannada text processing',
        quality: 'Basic',
        accent: 'System Default'
      });
    });

    // Sort by quality: Premium > Good > Basic
    const sortedVoices = kannadaCompatibleVoices.sort((a, b) => {
      const qualityOrder = { 'Premium': 0, 'Good': 1, 'Basic': 2 };
      return qualityOrder[a.quality] - qualityOrder[b.quality];
    });

    setAvailableVoices(sortedVoices);
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    
    if (value === 'auto') {
      onVoiceSelect(null); // Use automatic voice selection
    } else {
      const selectedKannadaVoice = availableVoices.find(v => v.voice.name === value);
      onVoiceSelect(selectedKannadaVoice?.voice || null);
    }
  };

  const testVoice = (kannadaVoice: KannadaVoice) => {
    if (isTestSpeaking) return;
    
    setIsTestSpeaking(true);
    speechSynthesis.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(testPhrase);
    utterance.voice = kannadaVoice.voice;
    utterance.lang = kannadaVoice.voice.lang;
    utterance.rate = 0.67;
    utterance.pitch = 0.76;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsTestSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsTestSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Premium': return 'text-yellow-600';
      case 'Good': return 'text-green-600';
      case 'Basic': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'Premium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Good': return 'bg-green-100 text-green-800 border-green-300';
      case 'Basic': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-orange-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎵</span>
        <h3 className="text-lg font-semibold text-orange-800">
          Kannada Voice Selection
        </h3>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose your preferred voice for Kannada:
        </label>
        
        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="auto">🤖 Auto Select (Smart Selection)</option>
          
          {availableVoices.map((kannadaVoice, index) => (
            <option key={index} value={kannadaVoice.voice.name}>
              {kannadaVoice.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Options List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Available Kannada Voices:
        </h4>
        
        {availableVoices.map((kannadaVoice, index) => (
          <div
            key={index}
            className={`p-3 rounded-md border transition-colors ${
              selectedVoice === kannadaVoice.voice.name
                ? 'bg-orange-50 border-orange-300'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {kannadaVoice.displayName}
                  </span>
                  
                  <span className={`px-2 py-1 rounded text-xs border ${getQualityBadge(kannadaVoice.quality)}`}>
                    {kannadaVoice.quality}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {kannadaVoice.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🗣️ {kannadaVoice.accent}</span>
                  <span>🌐 {kannadaVoice.voice.lang}</span>
                </div>
              </div>
              
              <button
                onClick={() => testVoice(kannadaVoice)}
                disabled={isTestSpeaking}
                className="ml-3 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestSpeaking ? '🔊' : '▶️'} Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {availableVoices.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>Loading Kannada voices...</p>
          <p className="text-sm">Make sure speech synthesis is enabled in your browser.</p>
        </div>
      )}
      
      {/* Test Phrase Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <h5 className="text-sm font-medium text-blue-800 mb-1">
          🧪 Test Phrase:
        </h5>
        <p className="text-sm text-blue-700 font-mono">
          "{testPhrase}"
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Translation: "Hello, how are you? This is a Kannada voice test."
        </p>
      </div>
    </div>
  );
};

export default KannadaVoiceSelector;