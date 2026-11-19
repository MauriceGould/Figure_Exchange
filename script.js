const starterFigures = [
  { id: 1, name: "Saiyan Warrior Figure", series: "Galaxy Fighters", manufacturer: "Nova Toys", price: 64.99, condition: "Like New", availability: "For Sale", type: "Anime", description: "Displayed briefly and includes the original box." },
  { id: 2, name: "Masked Ninja Nendoroid", series: "Hidden Village", manufacturer: "Mini Works", price: 48, condition: "Opened / Displayed", availability: "For Trade", type: "Anime", description: "Complete with alternate face plates and accessories." },
  { id: 3, name: "Armored Hero Deluxe", series: "Metro Heroes", manufacturer: "Titan Collectibles", price: 89.5, condition: "New / Sealed", availability: "For Sale or Trade", type: "Action Figure", description: "Sealed deluxe release with additional hands and effects." },
  { id: 4, name: "Mecha Unit 01 Kit", series: "Future Defense", manufacturer: "BuildLab", price: 39.99, condition: "New / Sealed", availability: "For Sale", type: "Model Kit", description: "Unbuilt model kit with all runners sealed." },
  { id: 5, name: "Pirate Captain Scale Figure", series: "Grand Seas", manufacturer: "Ocean Works", price: 124, condition: "Like New", availability: "For Sale or Trade", type: "Anime", description: "1/7 scale figure with original packaging." },
  { id: 6, name: "Web Hero Classic", series: "Amazing Heroes", manufacturer: "Titan Collectibles", price: 55, condition: "Used", availability: "For Trade", type: "Action Figure", description: "Loose figure in good condition with accessories." }
];

const starterPosts = [
  { title: "What figure are you most excited for this year?", body: "Share the upcoming releases you already have on preorder or your wishlist." },
  { title: "Show off your display setup", body: "How are you organizing shelves, lighting, and backgrounds for your collection?" }
];

let figures = JSON.parse(localStorage.getItem("fxListings")) || starterFigures;
let wishlist = JSON.parse(localStorage.getItem("fxWishlist")) || [];
let collection = JSON.parse(localStorage.getItem("fxCollection")) || [];
let posts = JSON.parse(localStorage.getItem("fxPosts")) || starterPosts;
let currentTradeId = null;

const productGrid = document.querySelector("#product-grid");
const search = document.querySelector("#search");
const categoryFilter = document.querySelector("#category-filter");
const availabilityFilter = document.querySelector("#availability-filter");
const sort = document.querySelector("#sort");
const resultCount = document.querySelector("#result-count");
const listingForm = document.querySelector("#listing-form");
const listingMessage = document.querySelector("#listing-message");
const wishlistList = document.querySelector("#wishlist-list");
const collectionList = document.querySelector("#collection-list");
const postForm = document.querySelector("#post-form");
const discussionList = document.querySelector("#discussion-list");
const tradeDialog = document.querySelector("#trade-dialog");
const tradeTarget = document.querySelector("#trade-target");

function save() {
  localStorage.setItem("fxListings", JSON.stringify(figures));
  localStorage.setItem("fxWishlist", JSON.stringify(wishlist));
  localStorage.setItem("fxCollection", JSON.stringify(collection));
  localStorage.setItem("fxPosts", JSON.stringify(posts));
}

function getFilteredFigures() {
  const term = search.value.trim().toLowerCase();
  let results = figures.filter(figure => {
    const matchesSearch = `${figure.name} ${figure.series} ${figure.manufacturer}`.toLowerCase().includes(term);
    const matchesType = categoryFilter.value === "all" || figure.type === categoryFilter.value;
    const matchesAvailability = availabilityFilter.value === "all" || figure.availability === availabilityFilter.value;
    return matchesSearch && matchesType && matchesAvailability;
  });
  if (sort.value === "low") results.sort((a, b) => a.price - b.price);
  if (sort.value === "high") results.sort((a, b) => b.price - a.price);
  if (sort.value === "name") results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

function renderProducts() {
  const results = getFilteredFigures();
  resultCount.textContent = `${results.length} figure${results.length === 1 ? "" : "s"}`;
  productGrid.innerHTML = "";
  if (!results.length) {
    productGrid.innerHTML = '<p class="empty">No figures match your filters.</p>';
    return;
  }
  results.forEach(figure => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image" role="img" aria-label="Placeholder image for ${escapeHtml(figure.name)}">◎</div>
      <p class="product-meta">${escapeHtml(figure.type)} · ${escapeHtml(figure.condition)}</p>
      <h3>${escapeHtml(figure.name)}</h3>
      <p>${escapeHtml(figure.series)}</p>
      <p class="product-price">$${Number(figure.price).toFixed(2)}</p>
      <p><strong>${escapeHtml(figure.availability)}</strong></p>
      <p>${escapeHtml(figure.description)}</p>
      <div class="product-actions">
        <button class="small-button" data-action="wishlist" data-id="${figure.id}">Wishlist</button>
        <button class="small-button" data-action="collection" data-id="${figure.id}">Collection</button>
        ${figure.availability.includes("Trade") ? `<button class="small-button" data-action="trade" data-id="${figure.id}">Trade Offer</button>` : ""}
      </div>`;
    productGrid.append(card);
  });
}

function renderSaved() {
  renderSavedList(wishlistList, wishlist, "Your wishlist is empty.", "wishlist");
  renderSavedList(collectionList, collection, "Your collection is empty.", "collection");
}

function renderSavedList(container, ids, emptyText, type) {
  container.innerHTML = "";
  const items = ids.map(id => figures.find(f => f.id === id)).filter(Boolean);
  if (!items.length) {
    container.innerHTML = `<p class="empty">${emptyText}</p>`;
    return;
  }
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "saved-item";
    div.innerHTML = `<strong>${escapeHtml(item.name)}</strong><br><span>${escapeHtml(item.series)}</span><br><button class="small-button" data-remove="${type}" data-id="${item.id}">Remove</button>`;
    container.append(div);
  });
}

function renderPosts() {
  discussionList.innerHTML = "";
  posts.slice().reverse().forEach(post => {
    const article = document.createElement("article");
    article.className = "discussion";
    article.innerHTML = `<h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.body)}</p>`;
    discussionList.append(article);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

[search, categoryFilter, availabilityFilter, sort].forEach(control => control.addEventListener("input", renderProducts));

productGrid.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  if (action === "wishlist") toggleSaved(wishlist, id);
  if (action === "collection") toggleSaved(collection, id);
  if (action === "trade") openTrade(id);
  save();
  renderSaved();
});

function toggleSaved(list, id) {
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
}

function openTrade(id) {
  const figure = figures.find(item => item.id === id);
  if (!figure) return;
  currentTradeId = id;
  tradeTarget.textContent = `You are making an offer for ${figure.name}.`;
  if (typeof tradeDialog.showModal === "function") tradeDialog.showModal();
}

document.querySelector("#send-trade").addEventListener("click", event => {
  const offered = document.querySelector("#trade-item").value.trim();
  if (!offered) {
    event.preventDefault();
    document.querySelector("#trade-item").focus();
    return;
  }
  alert(`Demo trade offer sent: ${offered}`);
  document.querySelector("#trade-item").value = "";
  document.querySelector("#trade-note").value = "";
  currentTradeId = null;
});

listingForm.addEventListener("submit", event => {
  event.preventDefault();
  listingMessage.textContent = "";
  if (!listingForm.checkValidity()) {
    listingMessage.textContent = "Please complete all required fields with valid information.";
    listingForm.reportValidity();
    return;
  }
  const data = new FormData(listingForm);
  figures.push({
    id: Date.now(),
    name: data.get("name").trim(),
    series: data.get("series").trim(),
    manufacturer: data.get("manufacturer").trim() || "Independent Seller",
    price: Number(data.get("price")),
    condition: data.get("condition"),
    availability: data.get("availability"),
    type: data.get("type"),
    description: data.get("description").trim()
  });
  save();
  listingForm.reset();
  listingMessage.textContent = "Your listing was added to the marketplace.";
  renderProducts();
});

function handleRemove(event) {
  const button = event.target.closest("button[data-remove]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const list = button.dataset.remove === "wishlist" ? wishlist : collection;
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  save();
  renderSaved();
}

wishlistList.addEventListener("click", handleRemove);
collectionList.addEventListener("click", handleRemove);

postForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.querySelector("#post-title").value.trim();
  const body = document.querySelector("#post-body").value.trim();
  if (!title || !body) return;
  posts.push({ title, body });
  save();
  postForm.reset();
  renderPosts();
});

renderProducts();
renderSaved();
renderPosts();
