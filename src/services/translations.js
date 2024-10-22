const ES_AR = 'es-AR';
const EN_US = 'en-US';

const PROJECT_ID = 'cm2j33qe800029qwj6njk5j88';
let translations = null;
let language = ES_AR;

// Función para obtener las traducciones desde la API
export async function getTranslations(lang, callback) {
    localStorage.clear();
    translations = null;
    language = lang;
    
    // Si el idioma es español, no necesitamos llamar a la API
    if (language === ES_AR) {
        return callback ? callback() : false;
    }

    // Llamada dinámica a la API usando el idioma seleccionado
    return await fetch(`https://traducila.vercel.app/api/translations/${PROJECT_ID}/${language}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener traducciones: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Guardar traducciones en localStorage para acceso rápido
            localStorage.setItem('translations', JSON.stringify(data));
            translations = data;
            if (callback) callback(); // Llamar callback una vez que las traducciones se han cargado
        })
        .catch(error => {
            console.error('Error al obtener las traducciones:', error);
            return false;
        });
}

// Función para obtener la frase traducida basada en la clave
export function getPhrase(key) {
    if (!translations) {
        const locals = localStorage.getItem('translations');
        translations = locals ? JSON.parse(locals) : null;
    }

    let phrase = key;
    if (translations && translations[key]) {
        phrase = translations[key];
    }

    return phrase;
}

// Verificar si el idioma es permitido
function isAllowedLanguage(language) {
    const allowedLanguages = ['es-AR', 'en-US', 'pt-BR', 'de-DE', 'fr-FR'];
    return allowedLanguages.includes(language);
}

// Función para obtener la configuración del idioma desde la URL o navegador
export function getLanguageConfig() {
    let languageConfig;

    // Obtener el idioma desde la URL o el path
    const path = window.location.pathname !== '/' ? window.location.pathname : null;
    const params = new URL(window.location.href).searchParams;
    const queryLang = params.get('lang');

    languageConfig = path ?? queryLang;

    if (languageConfig) {
        if (isAllowedLanguage(languageConfig)) {
            return languageConfig;
        }
    }

    // Verificar el idioma del navegador
    const browserLanguage = window.navigator.language;
    if (isAllowedLanguage(browserLanguage)) {
        return browserLanguage;
    }

    // Por defecto, si no se encuentra otro idioma, usar español (ES_AR)
    return ES_AR;
}
