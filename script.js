// Ganti dengan API key kamu
const API_KEY = "c1f6796c85574347b91667bf33473463";
// Endpoint "everything" agar bebas query kategori custom
const BASE_URL = "https://newsapi.org/v2";

const cardsContainer = document.getElementById("cards-container");
const newsCardTemplate = document.getElementById("template-news-card");
const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");
const messageBox = document.getElementById("message");

// Mapping nav -> query yang lebih spesifik
const NAV_QUERIES = {
  finance: "(finance OR business) AND economy",
  sports: "sports",
  crypto: "(crypto OR cryptocurrency OR bitcoin OR ethereum)",
  international: "(world OR geopolitics OR international relations)",
  technical: "(software engineering OR programming OR devops OR cloud)",
  ai: "(artificial intelligence OR machine learning OR LLM)",
  education: "(education OR higher education OR curriculum OR pedagogy)"
};

let curSelectedNav = null;

// Init: muat berita populer Indonesia sebagai default
window.addEventListener("load", () => {
  // default query yang relevan untuk pengguna di Indonesia
  fetchNews("Indonesia");
  setActiveNav(null);
});

function setActiveNav(el) {
  if (curSelectedNav) curSelectedNav.classList.remove("active");
  curSelectedNav = el;
  if (curSelectedNav) curSelectedNav.classList.add("active");
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.hidden = false;
}
function clearMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}

async function fetchNews(query) {
  clearMessage();
  cardsContainer.innerHTML = "";

  // Merapikan query
  const q = typeof query === "string" ? query : "";
  const params = new URLSearchParams({
    q,
    sortBy: "publishedAt",
    pageSize: "24",
    apiKey: API_KEY
  });

  const endpoint = "https://api.allorigins.win/raw?url=" +
  encodeURIComponent(`${BASE_URL}/everything?${params.toString()}`);
= `${BASE_URL}/everything?${params.toString()}`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      // NewsAPI sering blok request client-side pada plan tertentu
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    if (data.status !== "ok") {
      throw new Error(data.message || "Request gagal");
    }

    const articles = Array.isArray(data.articles) ? data.articles : [];
    if (articles.length === 0) {
      showMessage("Tidak ada hasil untuk pencarian ini.");
      return;
    }

    bindData(articles);
  } catch (err) {
    console.error(err);
    showMessage("Gagal memuat berita. Cek API key, kuota, atau kebijakan CORS.");
  }
}

function bindData(articles) {
  cardsContainer.innerHTML = "";
  for (const article of articles) {
    const card = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(card, article);
    cardsContainer.appendChild(card);
  }
}

function fillDataInCard(cardClone, article) {
  const imgEl = cardClone.querySelector(".news-img");
  const titleEl = cardClone.querySelector(".news-title");
  const sourceEl = cardClone.querySelector(".news-source");
  const descEl = cardClone.querySelector(".news-desc");
  const cardRoot = cardClone.querySelector(".card");

  const imgSrc =
    article.urlToImage ||
    "https://placehold.co/800x400?text=No+Image";
  imgEl.src = imgSrc;
  imgEl.alt = article.title || "news-image";

  titleEl.textContent = article.title || "Tanpa judul";
  descEl.textContent = article.description || "Tidak ada deskripsi.";

  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
    : "Waktu tidak diketahui";

  const sourceName = article.source && article.source.name ? article.source.name : "Sumber tidak diketahui";
  sourceEl.textContent = `${sourceName} · ${published}`;

  cardRoot.addEventListener("click", () => {
    try {
      const win = window.open(article.url, "_blank", "noopener,noreferrer");
      if (win) win.opener = null;
    } catch (_) {
      // no-op
    }
  });
}

// Event nav
document.getElementById("nav-list").addEventListener("click", (e) => {
  const item = e.target.closest(".nav-item");
  if (!item) return;

  const key = item.dataset.query;
  const mapped = NAV_QUERIES[key] || key;
  fetchNews(mapped);
  setActiveNav(item);
});

// Event search
searchButton.addEventListener("click", () => {
  const q = searchText.value.trim();
  if (!q) return;
  fetchNews(q);
  setActiveNav(null);
});

searchText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = searchText.value.trim();
    if (!q) return;
    fetchNews(q);
    setActiveNav(null);
  }
});
