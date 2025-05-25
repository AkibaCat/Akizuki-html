let translations = {};

// 获取浏览器首选语言并匹配可用语言
function getBrowserLanguage() {
    const availableLanguages = ['zh-CN', 'zh-TW', 'en', 'ja'];
    const browserLanguages = navigator.languages || [navigator.language];

    for (const lang of browserLanguages) {
        // 检查是否有完全匹配的语言
        if (availableLanguages.includes(lang)) {
            return lang;
        }
        // 检查语言代码的前两位是否匹配
        const langCode = lang.substring(0, 2);
        const matchedLang = availableLanguages.find(l => l.startsWith(langCode));
        if (matchedLang) {
            return matchedLang;
        }
    }
    // 默认返回简体中文
    return 'zh-CN';
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`./lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        updateLanguage();
    } catch (error) {
        console.error('Error loading translations:', error);
        // 出错时默认加载简体中文
        loadTranslations('zh-CN');
    }
}

function updateLanguage() {
    const lang = document.getElementById('language-selector').value;
    document.documentElement.lang = lang;
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[key]) {
            element.innerHTML = translations[key];
        }
    });
}

document.getElementById('language-selector').addEventListener('change', (event) => {
    loadTranslations(event.target.value);
});

// 初始加载浏览器语言
const browserLang = getBrowserLanguage();
document.getElementById('language-selector').value = browserLang;
loadTranslations(browserLang);