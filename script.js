// ===================== ТВОЙ API КЛЮЧ =====================
// (вставлен прямо в URL ниже, не нужна отдельная переменная, но для наглядности оставлю)
const API_KEY = "cd7642feb290b582038d7561d7deafdb";  // твой ключ
const PAGE_SIZE = 20;

let currentQuery = "главные новости";
let currentPage = 1;
let totalArticlesFound = 0;
let isLoading = false;

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const newsGrid = document.getElementById("newsGrid");
const loadMoreWrapper = document.getElementById("loadMoreWrapper");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const hashtagsContainer = document.getElementById("hashtagsContainer");

const categories = ["music", "technology", "sports", "science", "health", "business", "entertainment", "gaming", "politics", "world"];

function renderHashtags() {
    hashtagsContainer.innerHTML = "";
    for (let i = 0; i < categories.length; i++) {
        const tag = categories[i];
        const tagElement = document.createElement("span");
        tagElement.className = "hashtag";
        tagElement.setAttribute("data-tag", tag);
        tagElement.textContent = "#" + tag;
        tagElement.addEventListener("click", function() {
            searchInput.value = tag;
            performSearch();
        });
        hashtagsContainer.appendChild(tagElement);
    }
}

async function fetchNews(reset = true) {
    if (isLoading) return;
    isLoading = true;

    if (reset) {
        currentPage = 1;
        newsGrid.innerHTML = '<div class="status-msg">📡 Загружаем новости...</div>';
        loadMoreWrapper.style.display = "none";
    }

    // ===================== ТВОЙ URL С КЛЮЧОМ =====================
    // ЭТО ТОТ САМЫЙ URL, КОТОРЫЙ ТЫ ХОТЕЛ ВСТАВИТЬ
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(currentQuery)}&max=${PAGE_SIZE}&page=${currentPage}&apikey=${API_KEY}`;
    // ============================================================

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Ошибка загрузки новостей");
        }

        const articles = data.articles || [];
        totalArticlesFound = data.totalArticles || 0;

        if (reset) {
            renderArticles(articles);
        } else {
            appendArticles(articles);
        }

        const currentCardCount = document.querySelectorAll(".news-card").length;
        if (articles.length === PAGE_SIZE && currentCardCount < totalArticlesFound) {
            loadMoreWrapper.style.display = "block";
        } else {
            loadMoreWrapper.style.display = "none";
            if (articles.length === 0 && reset) {
                newsGrid.innerHTML = `<div class="status-msg error-msg">😕 По запросу «${escapeHtml(currentQuery)}» ничего не найдено. Попробуйте другую тему.</div>`;
            }
        }
    } catch (error) {
        console.error("Ошибка:", error);
        if (reset) {
            newsGrid.innerHTML = `<div class="status-msg error-msg">⚠️ Ошибка: ${error.message}. Проверь API-ключ или интернет.</div>`;
        } else {
            const errorDiv = document.createElement("div");
            errorDiv.className = "status-msg error-msg";
            errorDiv.textContent = "❌ Не удалось загрузить ещё новости.";
            newsGrid.appendChild(errorDiv);
        }
        loadMoreWrapper.style.display = "none";
    } finally {
        isLoading = false;
    }
}

function renderArticles(articles) {
    if (!articles.length) {
        newsGrid.innerHTML = '<div class="status-msg">Новостей нет :(</div>';
        return;
    }
    newsGrid.innerHTML = "";
    for (let i = 0; i < articles.length; i++) {
        createCard(articles[i]);
    }
}

function appendArticles(articles) {
    for (let i = 0; i < articles.length; i++) {
        createCard(articles[i]);
    }
}

function createCard(article) {
    const card = document.createElement("div");
    card.className = "news-card";

    let imageUrl = article.image;
    if (!imageUrl || imageUrl === "") {
        imageUrl = "https://placehold.co/600x400?text=Нет+изображения";
    }

    let pubDate = "Недавно";
    if (article.publishedAt) {
        const date = new Date(article.publishedAt);
        pubDate = date.toLocaleDateString("ru-RU");
    }

    const title = article.title || "Без заголовка";
    const description = article.description || "Нажмите на заголовок, чтобы прочитать полную статью.";
    const sourceName = article.source?.name || "Источник";

    card.innerHTML = `
        <img class="news-img" src="${imageUrl}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='https://placehold.co/600x400?text=Изображение+недоступно'">
        <div class="news-content">
            <div class="news-title">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
            </div>
            <div class="news-description">
                ${escapeHtml(description).substring(0, 160)}${escapeHtml(description).length > 160 ? "…" : ""}
            </div>
            <div class="news-meta">
                <span>📰 ${escapeHtml(sourceName)}</span>
                <span>📅 ${pubDate}</span>
            </div>
        </div>
    `;

    newsGrid.appendChild(card);
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function performSearch() {
    let newQuery = searchInput.value.trim();
    if (newQuery === "") {
        alert("Пожалуйста, введите тему для поиска");
        return;
    }
    currentQuery = newQuery;
    fetchNews(true);
}

function loadMore() {
    if (isLoading) return;
    currentPage++;
    fetchNews(false);
}

function initDefaultNews() {
    currentQuery = "главные новости";
    searchInput.value = currentQuery;
    fetchNews(true);
}

searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        performSearch();
    }
});
loadMoreBtn.addEventListener("click", loadMore);

renderHashtags();
initDefaultNews();