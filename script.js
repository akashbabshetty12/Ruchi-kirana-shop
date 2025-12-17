/************** INITIAL DATA **************/
let products = JSON.parse(localStorage.getItem("products")) || [
 { id: 1, name: "Gold Flake", category: "Cigarette", price: 60, active: true },
 { id: 2, name: "Bristol", category: "Cigarette", price: 140, active: true },
 { id: 3, name: "Gold Flake king", category: "Cigarette", price: 50, active: true }
];

let cart = {};
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

/************** ADMIN PIN **************/
let savedAdminPin = localStorage.getItem("adminPin");

function requestAdminPin() {
  if (!savedAdminPin) {
    const newPin = prompt("Set new Admin PIN:");
    if (!newPin) return false;
    localStorage.setItem("adminPin", newPin);
    savedAdminPin = newPin;
    alert("Admin PIN created successfully!");
    return true;
  }
  const entered = prompt("Enter Admin PIN:");
  if (entered === savedAdminPin) return true;
  alert("Incorrect PIN.");
  return false;
}

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

/************** CUSTOMER NAME VALIDATION **************/
function validateCustomerName(showAlert = true) {
  const n1 = document.getElementById("custName")?.value.trim() || "";
  const n2 = document.getElementById("custNameDrawer")?.value.trim() || "";
  if (!n1 || !n2) {
    if (showAlert) alert("Please enter customer name.");
    return false;
  }
  return true;
}

/************** CATEGORY **************/
function getCategories() {
  return [...new Set(products.filter(p => p.active).map(p => p.category))];
}

function renderCategoryTabs() {
  const wrap = document.getElementById("categoryTabs");
  if (!wrap) return;
  wrap.innerHTML = "";

  const all = document.createElement("button");
  all.textContent = "All";
  all.className = selectedCategory === "All" ? "active" : "";
  all.onclick = () => { selectedCategory = "All"; renderCategoryTabs(); renderProducts(); };
  wrap.appendChild(all);

  getCategories().forEach(cat => {
    const b = document.createElement("button");
    b.textContent = cat;
    b.className = selectedCategory === cat ? "active" : "";
    b.onclick = () => { selectedCategory = cat; renderCategoryTabs(); renderProducts(); };
    wrap.appendChild(b);
  });
}

/************** PRODUCTS **************/
function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;
  list.innerHTML = "";

  const filtered = products.filter(
    p => p.active && (selectedCategory === "All" || p.category === selectedCategory)
  );

  filtered.forEach(p => {
    const qty = cart[p.id] || 0;
    list.innerHTML += `
      <div class="product">
        <div>
          <b>${p.name}</b><br>
          <small>${p.category}</small><br>
          ₹${p.price}
        </div>
        <div>
          <button onclick="updateQty(${p.id},-1)">−</button>
          <span>${qty}</span>
          <button onclick="updateQty(${p.id},1)">+</button>
        </div>
      </div>
    `;
  });
}

/************** CART **************/
function updateQty(id, delta) {
  if (!validateCustomerName()) return;

  const before = getTotalItems();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];

  const after = getTotalItems();

  if (before === 0 && after > 0) {
    currentBillDate = new Date();
    document.getElementById("billingDate").textContent = formatDateTime(currentBillDate);
  }

  if (after === 0) clearCart();
  else showDrawer();

  renderProducts();
  renderBill();
}

function getTotalItems() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

/************** BILL **************/
function renderBill() {
  const body = document.getElementById("billBody");
  if (!body) return;
  body.innerHTML = "";

  let total = 0;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    if (!p) continue;
    const amt = p.price * cart[id];
    total += amt;
    body.innerHTML += `<tr><td>${p.name}</td><td>${cart[id]}</td><td>₹${amt}</td></tr>`;
  }

  document.getElementById("grandTotalText").textContent = "₹" + total;
  document.getElementById("drawerTotal").textContent = "₹" + total;
}

/************** DRAWER **************/
function showDrawer() {
  document.getElementById("cartDrawer")?.classList.remove("hidden");
}
function hideDrawer() {
  document.getElementById("cartDrawer")?.classList.add("hidden");
}

/************** CLEAR **************/
function clearCart() {
  cart = {};
  currentBillDate = null;
  document.getElementById("billingDate").textContent = "—";
  renderProducts();
  renderBill();
  hideDrawer();
}

/************** DATE **************/
function formatDateTime(dt) {
  return dt ? dt.toLocaleString() : "—";
}

/************** BILL TEXT **************/
function buildBillText() {
  let text = `Ruchi Kirana Shop\n`;
  text += `Date: ${formatDateTime(currentBillDate || new Date())}\n`;
  text += `Customer: ${document.getElementById("custName").value}\n`;
  text += `-------------------\n`;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    if (!p) continue;
    text += `${p.name} × ${cart[id]} = ₹${p.price * cart[id]}\n`;
  }

  text += `-------------------\n`;
  text += `TOTAL: ${document.getElementById("grandTotalText").textContent}`;
  return text;
}

/************** HISTORY SAVE **************/
function saveBillToHistory() {
  if (!validateCustomerName()) return;

  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    id: Date.now(),
    date: new Date().toISOString(),
    customerName: document.getElementById("custName").value,
    cart: { ...cart },
    total: document.getElementById("grandTotalText").textContent
  });
  localStorage.setItem("bills", JSON.stringify(bills));
}

/************** SHARE (SAVE + WHATSAPP TEXT) **************/
function shareToWhatsAppText() {
  if (!validateCustomerName()) return;

  saveBillToHistory(); // ✅ CONFIRMED SAVE ON SHARE

  const text = encodeURIComponent(buildBillText());
  window.open("https://wa.me/?text=" + text, "_blank");
}

/************** INIT **************/
renderCategoryTabs();
renderProducts();
renderBill();

/************** GLOBAL **************/
window.shareToWhatsAppText = shareToWhatsAppText;
window.saveBillToHistory = saveBillToHistory;
