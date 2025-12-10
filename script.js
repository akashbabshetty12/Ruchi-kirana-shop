/************** CONFIG **************/
const ADMIN_PIN = "1234";
let adminUnlocked = false;

/************** INITIAL DATA **************/
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name: "Rice", category: "Staples", price: 60, active: true },
  { id: 2, name: "Oil", category: "Oil", price: 140, active: true },
  { id: 3, name: "Sugar", category: "Staples", price: 50, active: true },
  { id: 4, name: "Biscuits", category: "Snacks", price: 20, active: true },
  { id: 5, name: "Cold Drink", category: "Beverages", price: 35, active: true }
];

let cart = {};
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

/************** NORMALIZE PRODUCTS **************/
function normalizeProducts() {
  products = products.map(p => ({
    ...p,
    category: p.category || "General",
    active: p.active === true || p.active === "true",
    price: Number(p.price)
  }));
  localStorage.setItem("products", JSON.stringify(products));
}
normalizeProducts();

/************** VALIDATION: CUSTOMER NAME **************/
function validateCustomerName(showError = true) {
  const nameElem = document.getElementById("custName");
  const drawerNameElem = document.getElementById("custNameDrawer");
  const name = nameElem ? nameElem.value.trim() : "";
  const drawerName = drawerNameElem ? drawerNameElem.value.trim() : "";

  const err1 = document.getElementById("nameError");
  const err2 = document.getElementById("nameErrorDrawer");

  if (name === "" || drawerName === "") {
    if (showError) {
      if (err1) err1.style.display = "block";
      if (err2) err2.style.display = "block";
    }
    return false;
  }

  if (err1) err1.style.display = "none";
  if (err2) err2.style.display = "none";
  return true;
}

/************** CATEGORY TABS **************/
function getCategories() {
  const set = new Set();
  products.forEach(p => p.active && set.add(p.category));
  return [...set];
}

function renderCategoryTabs() {
  const wrap = document.getElementById("categoryTabs");
  if (!wrap) return;
  wrap.innerHTML = "";

  const btnAll = document.createElement("button");
  btnAll.className = "catTab" + (selectedCategory === "All" ? " active" : "");
  btnAll.textContent = "All";
  btnAll.onclick = () => {
    selectedCategory = "All";
    renderCategoryTabs();
    renderProducts();
  };
  wrap.appendChild(btnAll);

  getCategories().forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "catTab" + (selectedCategory === cat ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => {
      selectedCategory = cat;
      renderCategoryTabs();
      renderProducts();
    };
    wrap.appendChild(btn);
  });
}

/************** RENDER PRODUCTS **************/
function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;
  list.innerHTML = "";

  const filtered = products.filter(
    p => p.active && (selectedCategory === "All" || p.category === selectedCategory)
  );

  if (filtered.length === 0) {
    list.innerHTML = "<div class='small'>No products in this category.</div>";
    return;
  }

  filtered.forEach(p => {
    const qty = cart[p.id] || 0;
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-cat">${p.category}</div>
        <div class="product-price">₹${p.price.toFixed(2)}</div>
      </div>
      <div class="qty">
        <button onclick="updateQty(${p.id}, -1)">−</button>
        <span>${qty}</span>
        <button class="plus" onclick="updateQty(${p.id}, 1)">+</button>
      </div>
    `;
    list.appendChild(div);
  });
}

/************** UPDATE QTY **************/
function updateQty(id, delta) {
  if (!validateCustomerName()) {
    alert("Please enter custome
