// Bland AI Multi-language Support API
// Handles language preferences and localization for Bland AI interactions

const express = require('express');
const router = express.Router();

// Mock language preferences storage (in production, use database)
let languagePreferences = {};
let translationCache = new Map();

// Comprehensive language support with regional variants
const supportedLanguages = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    region: 'US',
    rtl: false,
    flag: '🇺🇸',
    variants: ['en-US', 'en-GB', 'en-AU', 'en-CA']
  },
  { 
    code: 'ar', 
    name: 'Arabic', 
    nativeName: 'العربية',
    region: 'AE',
    rtl: true,
    flag: '🇦🇪',
    variants: ['ar-AE', 'ar-SA', 'ar-EG', 'ar-JO']
  },
  { 
    code: 'fr', 
    name: 'French', 
    nativeName: 'Français',
    region: 'FR',
    rtl: false,
    flag: '🇫🇷',
    variants: ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH']
  },
  { 
    code: 'de', 
    name: 'German', 
    nativeName: 'Deutsch',
    region: 'DE',
    rtl: false,
    flag: '🇩🇪',
    variants: ['de-DE', 'de-AT', 'de-CH']
  },
  { 
    code: 'es', 
    name: 'Spanish', 
    nativeName: 'Español',
    region: 'ES',
    rtl: false,
    flag: '🇪🇸',
    variants: ['es-ES', 'es-MX', 'es-AR', 'es-CO']
  },
  { 
    code: 'zh', 
    name: 'Chinese', 
    nativeName: '中文',
    region: 'CN',
    rtl: false,
    flag: '🇨🇳',
    variants: ['zh-CN', 'zh-TW', 'zh-HK']
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिन्दी',
    region: 'IN',
    rtl: false,
    flag: '🇮🇳',
    variants: ['hi-IN']
  },
  { 
    code: 'ru', 
    name: 'Russian', 
    nativeName: 'Русский',
    region: 'RU',
    rtl: false,
    flag: '🇷🇺',
    variants: ['ru-RU']
  },
  { 
    code: 'ja', 
    name: 'Japanese', 
    nativeName: '日本語',
    region: 'JP',
    rtl: false,
    flag: '🇯🇵',
    variants: ['ja-JP']
  },
  { 
    code: 'ko', 
    name: 'Korean', 
    nativeName: '한국어',
    region: 'KR',
    rtl: false,
    flag: '🇰🇷',
    variants: ['ko-KR']
  }
];

// Common translations for system messages
const systemTranslations = {
  en: {
    welcome: "Hello! I'm your AI assistant. How can I help you today?",
    error: "I'm sorry, I encountered an error. Please try again.",
    goodbye: "Thank you for chatting with us! Have a wonderful day!",
    connecting: "Connecting...",
    offline: "Currently offline",
    typing: "AI is typing...",
    retry: "Try again",
    send: "Send",
    close: "Close"
  },
  ar: {
    welcome: "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
    error: "أعتذر، واجهت خطأ. يرجى المحاولة مرة أخرى.",
    goodbye: "شكراً لك على التحدث معنا! أتمنى لك يوماً رائعاً!",
    connecting: "جاري الاتصال...",
    offline: "غير متصل حالياً",
    typing: "الذكي الاصطناعي يكتب...",
    retry: "حاول مرة أخرى",
    send: "إرسال",
    close: "إغلاق"
  },
  fr: {
    welcome: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
    error: "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.",
    goodbye: "Merci d'avoir discuté avec nous ! Passez une excellente journée !",
    connecting: "Connexion en cours...",
    offline: "Actuellement hors ligne",
    typing: "L'IA tape...",
    retry: "Réessayer",
    send: "Envoyer",
    close: "Fermer"
  },
  de: {
    welcome: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
    error: "Es tut mir leid, ich bin auf einen Fehler gestoßen. Bitte versuchen Sie es erneut.",
    goodbye: "Vielen Dank für das Gespräch mit uns! Haben Sie einen wunderbaren Tag!",
    connecting: "Verbindung wird hergestellt...",
    offline: "Derzeit offline",
    typing: "KI tippt...",
    retry: "Erneut versuchen",
    send: "Senden",
    close: "Schließen"
  },
  es: {
    welcome: "¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?",
    error: "Lo siento, encontré un error. Por favor, inténtalo de nuevo.",
    goodbye: "¡Gracias por chatear con nosotros! ¡Que tengas un día maravilloso!",
    connecting: "Conectando...",
    offline: "Actualmente desconectado",
    typing: "La IA está escribiendo...",
    retry: "Intentar de nuevo",
    send: "Enviar",
    close: "Cerrar"
  }
};

// Utility function for logging language actions
const logLanguageAction = (action, data, error = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    data,
    error,
    id: 'lang_log_' + Date.now()
  };
  console.log('Bland AI Language Log:', logEntry);
};

// Language validation middleware
const validateLanguageCode = (req, res, next) => {
  const { language } = req.body;
  if (language && !supportedLanguages.find(lang => lang.code === language || lang.variants.includes(language))) {
    return res.status(400).json({ 
      error: 'Unsupported language code',
      code: 'INVALID_LANGUAGE',
      supportedLanguages: supportedLanguages.map(lang => lang.code)
    });
  }
  next();
};

// GET /api/bland-ai/languages - List supported languages
router.get('/languages', async (req, res) => {
  try {
    const { detailed = false } = req.query;
    
    logLanguageAction('LANGUAGES_LISTED', { detailed });
    
    if (detailed === 'true') {
      res.json({ 
        success: true,
        languages: supportedLanguages,
        total: supportedLanguages.length,
        defaultLanguage: 'en'
      });
    } else {
      res.json({ 
        success: true,
        languages: supportedLanguages.map(lang => ({
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          flag: lang.flag,
          rtl: lang.rtl
        })),
        total: supportedLanguages.length,
        defaultLanguage: 'en'
      });
    }
  } catch (error) {
    logLanguageAction('LANGUAGES_LIST_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while fetching languages',
      code: 'LANGUAGES_FETCH_FAILED'
    });
  }
});

// GET /api/bland-ai/language-preference/:userId - Get user language preference
router.get('/language-preference/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ 
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID'
      });
    }
    
    const preference = languagePreferences[userId] || 'en';
    const languageInfo = supportedLanguages.find(lang => lang.code === preference);
    
    logLanguageAction('PREFERENCE_RETRIEVED', { userId, language: preference });
    
    res.json({ 
      success: true,
      userId, 
      language: preference,
      languageInfo: languageInfo || supportedLanguages.find(lang => lang.code === 'en')
    });
  } catch (error) {
    logLanguageAction('PREFERENCE_RETRIEVAL_ERROR', { userId: req.params.userId }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while retrieving language preference',
      code: 'PREFERENCE_RETRIEVAL_FAILED'
    });
  }
});

// POST /api/bland-ai/language-preference/:userId - Set user language preference
router.post('/language-preference/:userId', validateLanguageCode, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { language, autoDetect = false } = req.body;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ 
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID'
      });
    }
    
    if (!language) {
      return res.status(400).json({ 
        error: 'Language code is required',
        code: 'MISSING_LANGUAGE'
      });
    }
    
    // Store preference with metadata
    languagePreferences[userId] = {
      language,
      autoDetect,
      updatedAt: new Date(),
      source: autoDetect ? 'auto' : 'manual'
    };
    
    const languageInfo = supportedLanguages.find(lang => 
      lang.code === language || lang.variants.includes(language)
    );
    
    logLanguageAction('PREFERENCE_UPDATED', { userId, language, autoDetect });
    
    res.json({ 
      success: true,
      userId, 
      language,
      languageInfo,
      message: 'Language preference updated successfully'
    });
  } catch (error) {
    logLanguageAction('PREFERENCE_UPDATE_ERROR', { userId: req.params.userId }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while updating language preference',
      code: 'PREFERENCE_UPDATE_FAILED'
    });
  }
});

// GET /api/bland-ai/translations/:language - Get translations for a language
router.get('/translations/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { keys } = req.query; // Comma-separated list of translation keys
    
    const languageInfo = supportedLanguages.find(lang => 
      lang.code === language || lang.variants.includes(language)
    );
    
    if (!languageInfo) {
      return res.status(404).json({ 
        error: 'Language not supported',
        code: 'LANGUAGE_NOT_SUPPORTED'
      });
    }
    
    const baseLanguage = languageInfo.code;
    const translations = systemTranslations[baseLanguage] || systemTranslations.en;
    
    let result = translations;
    
    // Filter by specific keys if requested
    if (keys) {
      const requestedKeys = keys.split(',');
      result = {};
      requestedKeys.forEach(key => {
        if (translations[key]) {
          result[key] = translations[key];
        }
      });
    }
    
    logLanguageAction('TRANSLATIONS_RETRIEVED', { language, keysCount: Object.keys(result).length });
    
    res.json({ 
      success: true,
      language: baseLanguage,
      translations: result,
      languageInfo,
      cached: translationCache.has(`${baseLanguage}_${keys || 'all'}`)
    });
  } catch (error) {
    logLanguageAction('TRANSLATIONS_ERROR', { language: req.params.language }, error.message);
    res.status(500).json({ 
      error: 'Internal server error while fetching translations',
      code: 'TRANSLATIONS_FETCH_FAILED'
    });
  }
});

// POST /api/bland-ai/detect-language - Auto-detect language from text
router.post('/detect-language', async (req, res) => {
  try {
    const { text, userId } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required for language detection',
        code: 'MISSING_TEXT'
      });
    }
    
    // Simple language detection based on character patterns
    // In production, use a proper language detection library
    const detectedLanguage = detectLanguageFromText(text);
    const confidence = calculateDetectionConfidence(text, detectedLanguage);
    
    const languageInfo = supportedLanguages.find(lang => lang.code === detectedLanguage);
    
    // Auto-update user preference if confidence is high and userId provided
    if (userId && confidence > 0.8) {
      languagePreferences[userId] = {
        language: detectedLanguage,
        autoDetect: true,
        updatedAt: new Date(),
        source: 'auto_detected',
        confidence
      };
    }
    
    logLanguageAction('LANGUAGE_DETECTED', { 
      userId, 
      detectedLanguage, 
      confidence,
      textLength: text.length 
    });
    
    res.json({ 
      success: true,
      detectedLanguage,
      confidence,
      languageInfo,
      autoUpdated: userId && confidence > 0.8
    });
  } catch (error) {
    logLanguageAction('DETECTION_ERROR', { userId: req.body.userId }, error.message);
    res.status(500).json({ 
      error: 'Internal server error during language detection',
      code: 'DETECTION_FAILED'
    });
  }
});

// GET /api/bland-ai/language-stats - Get language usage statistics
router.get('/language-stats', async (req, res) => {
  try {
    const stats = {};
    const preferences = Object.values(languagePreferences);
    
    // Count language usage
    preferences.forEach(pref => {
      const lang = typeof pref === 'string' ? pref : pref.language;
      stats[lang] = (stats[lang] || 0) + 1;
    });
    
    // Calculate percentages
    const total = preferences.length;
    const languageStats = Object.entries(stats).map(([code, count]) => {
      const languageInfo = supportedLanguages.find(lang => lang.code === code);
      return {
        code,
        name: languageInfo?.name || code,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.count - a.count);
    
    logLanguageAction('STATS_RETRIEVED', { totalUsers: total, languagesUsed: languageStats.length });
    
    res.json({ 
      success: true,
      totalUsers: total,
      languageStats,
      mostPopular: languageStats[0] || { code: 'en', name: 'English', count: 0, percentage: 0 },
      supportedLanguagesCount: supportedLanguages.length
    });
  } catch (error) {
    logLanguageAction('STATS_ERROR', null, error.message);
    res.status(500).json({ 
      error: 'Internal server error while generating language statistics',
      code: 'STATS_GENERATION_FAILED'
    });
  }
});

// Helper functions for language detection
function detectLanguageFromText(text) {
  // Simple pattern-based detection
  // In production, use a proper library like franc or langdetect
  
  const patterns = {
    ar: /[\u0600-\u06FF\u0750-\u077F]/,
    zh: /[\u4e00-\u9fff]/,
    ja: /[\u3040-\u309f\u30a0-\u30ff]/,
    ko: /[\uac00-\ud7af]/,
    ru: /[\u0400-\u04FF]/,
    hi: /[\u0900-\u097F]/
  };
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Default to English if no specific patterns found
  return 'en';
}

function calculateDetectionConfidence(text, detectedLanguage) {
  // Simple confidence calculation based on text characteristics
  // In production, use proper confidence scoring
  
  const textLength = text.length;
  if (textLength < 10) return 0.3;
  if (textLength < 50) return 0.6;
  
  const patterns = {
    ar: /[\u0600-\u06FF\u0750-\u077F]/g,
    zh: /[\u4e00-\u9fff]/g,
    ja: /[\u3040-\u309f\u30a0-\u30ff]/g,
    ko: /[\uac00-\ud7af]/g,
    ru: /[\u0400-\u04FF]/g,
    hi: /[\u0900-\u097F]/g
  };
  
  const pattern = patterns[detectedLanguage];
  if (pattern) {
    const matches = text.match(pattern);
    const ratio = matches ? matches.length / textLength : 0;
    return Math.min(0.9, 0.5 + ratio);
  }
  
  return 0.7; // Default confidence for English
}

// Cleanup old preferences (run periodically)
const cleanupOldPreferences = () => {
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  let cleanedCount = 0;
  
  Object.keys(languagePreferences).forEach(userId => {
    const pref = languagePreferences[userId];
    const updatedAt = typeof pref === 'object' ? pref.updatedAt : new Date(0);
    
    if (new Date(updatedAt) < cutoffDate) {
      delete languagePreferences[userId];
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    logLanguageAction('PREFERENCES_CLEANUP', { cleanedCount, remainingCount: Object.keys(languagePreferences).length });
  }
};

// Run cleanup weekly
setInterval(cleanupOldPreferences, 7 * 24 * 60 * 60 * 1000);

module.exports = router;
