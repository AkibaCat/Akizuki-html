let translations = {};
let currentNewsIndex = 0;
let newsItems = [];
let autoSwitchTimer;

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

// 菜单按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu');
    const navList = document.querySelector('header nav ul');

    menuBtn.addEventListener('click', function() {
        navList.classList.toggle('show');
    });

    // 添加点击页面其他区域关闭侧边栏的逻辑
    document.addEventListener('click', function(event) {
        if (navList.classList.contains('show') && !navList.contains(event.target) && event.target !== menuBtn) {
            navList.classList.remove('show');
        }
    });

    // 读取新闻数据并渲染
    fetch('news.json')
        .then(response => response.json())
        .then(data => {
            const newsContainer = document.getElementById('news-container');
            const dotsContainer = document.getElementById('news-dots');
            // 限制新闻数量最多为 6 个
            const limitedNewsData = data.slice(0, 6); 
            newsItems = limitedNewsData.map(news => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.style.backgroundImage = `url('${news.image}')`;
                newsItem.innerHTML = `
                    <h3>${news.title}</h3>
                    <p>${news.content}</p>
                `;
                newsItem.addEventListener('click', () => {
                    window.open(news.link, '_blank');
                });
                newsItem.style.cursor = 'pointer';
                newsContainer.appendChild(newsItem);
                return newsItem;
            });

            // 创建原点指示器
            dots = limitedNewsData.map((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'news-dot';
                if (index === currentNewsIndex) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    currentNewsIndex = index;
                    resetAutoSwitch();
                    showNews(currentNewsIndex);
                });
                dotsContainer.appendChild(dot);
                return dot;
            });

            showNews(currentNewsIndex);
            startAutoSwitch();

            // 添加滚轮事件监听，阻止默认滚动行为
            newsContainer.addEventListener('wheel', (event) => {
                event.preventDefault();
                handleWheel(event);
            }, { passive: false });

            // 添加移动端触摸事件监听
            newsContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            newsContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        })
        .catch(error => console.error('获取新闻数据失败:', error));
});

function showNews(index) {
    newsItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            item.classList.remove('prev', 'next');
        } else if (i < index) {
            item.classList.add('prev');
            item.classList.remove('active', 'next');
        } else {
            item.classList.add('next');
            item.classList.remove('active', 'prev');
        }
    });

    // 更新原点指示器状态
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function handleSwipe() {
    const threshold = 50; // 滑动阈值，可根据需求调整
    if (touchEndX < touchStartX - threshold) {
        // 向左滑动，显示下一条新闻
        currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    } else if (touchEndX > touchStartX + threshold) {
        // 向右滑动，显示上一条新闻
        currentNewsIndex = (currentNewsIndex - 1 + newsItems.length) % newsItems.length;
    }
    resetAutoSwitch();
    showNews(currentNewsIndex);
}

function handleWheel(event) {
    resetAutoSwitch();
    if (event.deltaY > 0) {
        // 向下滚动，显示下一条新闻
        currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    } else {
        // 向上滚动，显示上一条新闻
        currentNewsIndex = (currentNewsIndex - 1 + newsItems.length) % newsItems.length;
    }
    showNews(currentNewsIndex);
}

function startAutoSwitch() {
    autoSwitchTimer = setInterval(() => {
        currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
        showNews(currentNewsIndex);
    }, 5000);
}

function resetAutoSwitch() {
    clearInterval(autoSwitchTimer);
    startAutoSwitch();
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


// 定义渲染所有新闻的函数
function renderAllNews() {
    const allNewsContainer = document.getElementById('all-news-container');
    if (!allNewsContainer) return;

    fetch('news.json')
      .then(response => response.json())
      .then(data => {
            allNewsContainer.innerHTML = '';
            data.forEach(news => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.style.backgroundImage = `url('${news.image}')`;
                newsItem.innerHTML = `
                    <h3>${news.title}</h3>
                    <p>${news.content}</p>
                `;
                newsItem.addEventListener('click', () => {
                    window.open(news.link, '_blank');
                });
                newsItem.style.cursor = 'pointer';
                allNewsContainer.appendChild(newsItem);
            });
        })
      .catch(error => console.error('获取新闻数据失败:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    // 若在新闻页面，渲染所有新闻
    if (document.getElementById('all-news-container')) {
        renderAllNews();
    }
});