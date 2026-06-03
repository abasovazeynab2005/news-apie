// ===================== НАСТРОЙКИ =====================
// ВАЖНО: Удалите этот ключ из кода перед публикацией на GitHub!
// Создайте новый в Dashboard GNews.
const API_KEY = "ВАШ_КЛЮЧ_СЮДА"; 
const PAGE_SIZE = 20;

let currentQuery = "главные новости";
let currentPage = 1;
let totalArticlesFound = 0;
let isLoading = false;

// DOM Элементы
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const newsGrid = document.getElementById("newsGrid");
const loadMoreWrapper = document.getElementById("loadMoreWrapper");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const hashtagsContainer = document.getElementById("hashtagsContainer");

const categories = ["music", "technology", "sports", "science", "health", "business", "entertainment", "gaming", "politics", "world"];

// Инициализация
function renderHashtags() {
    hashtagsContainer.innerHTML = "";
    categories.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.className = "hashtag";
        tagElement.textContent = "#" + tag;
        tagElement.addEventListener("click", () => {
            searchInput.value = tag;
            performSearch();
        });
        hashtagsContainer.appendChild(tagElement);
    });
}

// ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ
async function fetchNews(reset = true) {
    if (isLoading) return;
    isLoading = true;

    if (reset) {
        currentPage = 1;
        newsGrid.innerHTML = '<div class="status-msg">📡 Загружаем новости...</div>';
        loadMoreWrapper.style.display = "none";
    }

    // Использование прокси allorigins для обхода CORS
    const targetUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(currentQuery)}&max=${PAGE_SIZE}&page=${currentPage}&apikey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Ошибка сервера");
        
        const dataWrapper = await response.json();
        const data = JSON.parse(dataWrapper.contents);

        const articles = data.articles || [];
        totalArticlesFound = data.totalArticles || 0;

        if (reset) renderArticles(articles);
        else appendArticles(articles);

        loadMoreWrapper.style.display = (articles.length === PAGE_SIZE && document.querySelectorAll(".news-card").length < totalArticlesFound) ? "block" : "none";
        
    } catch (error) {
        newsGrid.innerHTML = `<div class="status-msg error-msg">⚠️ Ошибка: ${error.message}. Проверьте ключ API.</div>`;
    } finally {
        isLoading = false;
    }
}

// Вспомогательные функции
function renderArticles(articles) {
    newsGrid.innerHTML = articles.length ? "" : '<div class="status-msg">Новостей нет :(</div>';
    articles.forEach(createCard);
}

function appendArticles(articles) {
    articles.forEach(createCard);
}

function createCard(article) {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
        <img class="news-img" src="${article.image || 'https://placehold.co/600x400?text=Нет+картинки'}" loading="lazy">
        <div class="news-content">
            <div class="news-title"><a href="${article.url}" target="_blank">${article.title}</a></div>
            <div class="news-description">${(article.description || "").substring(0, 160)}...</div>
            <div class="news-meta"><span>📰 ${article.source?.name}</span></div>
        </div>
    `;
    newsGrid.appendChild(card);
}

function performSearch() {
    if (!searchInput.value.trim()) return alert("Введите тему");
    currentQuery = searchInput.value.trim();
    fetchNews(true);
}

// Слушатели событий
searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", (e) => e.key === "Enter" && performSearch());
loadMoreBtn.addEventListener("click", () => { currentPage++; fetchNews(false); });

renderHashtags();
fetchNews(true);