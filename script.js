/************** INITIAL DATA **************/
let products = JSON.parse(localStorage.getItem("products")) || [
 { id: 1, name: "Gold Flake", category: "Cigarette", price: 60, active: true },
 { id: 2, name: "Bristol", category: "Cigarette", price: 140, active: true }
];

let cart = {};
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

/************** DEVICE-BASED ADMIN PIN **************/
function requestAdminPin() {
  const savedAdminPin = localStorage.getItem("adminPin");

  if (!savedAdminPin) {
    const newPin = prompt("Set new Admin PIN:");
    if (!newPin) return false;
    localStorage.setItem("adminPin", newPin);
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
function validateCustomerName(showError = true) {
  const name = document.getElementById("custName")?.value.trim();
  if (!name) {
    if (showError) alert("Please enter customer name first.");
    return false;
  }
  return true;
}

/************** CATEGORY TABS **************/
function getCategories() {
  return [...new Set(products.filter(p => p.active).map(p => p.category))];
}

function renderCategoryTabs() {
  const wrap = document.getElementById("categoryTabs");
  if (!wrap) return;
  wrap.innerHTML = "";

  ["All", ...getCategories()].forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "catTab" + (selectedCategory === cat ? " active" : "");
    btn.onclick = () => {
      selectedCategory = cat;
      renderCategoryTabs();
      renderProducts();
    };
    wrap.appendChild(btn);
  });
}

/************** PRODUCTS **************/
function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;
  list.innerHTML = "";

  products
    .filter(p => p.active && (selectedCategory === "All" || p.category === selectedCategory))
    .forEach(p => {
      const qty = cart[p.id] || 0;
      list.innerHTML += `
        <div class="product">
          <div>
            <b>${p.name}</b><br>
            <small>${p.category}</small><br>
            ₹${p.price}
          </div>
          <div class="qty">
            <button onclick="updateQty(${p.id},-1)">−</button>
            <span>${qty}</span>
            <button onclick="updateQty(${p.id},1)">+</button>
          </div>
        </div>`;
    });
}

/************** CART **************/
function updateQty(id, delta) {
  if (!validateCustomerName()) return;

  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];

  if (Object.keys(cart).length === 1 && delta > 0) {
    currentBillDate = new Date();
  }

  renderProducts();
  renderBill();
}

function renderBill() {
  const body = document.getElementById("billBody");
  if (!body) return;
  body.innerHTML = "";

  let total = 0;

  Object.keys(cart).forEach(id => {
    const p = products.find(x => x.id == id);
    if (!p) return;
    const amt = p.price * cart[id];
    total += amt;

    body.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${cart[id]}</td>
        <td>₹${amt}</td>
      </tr>`;
  });

  document.getElementById("grandTotalText").textContent = "₹" + total.toFixed(2);
}

/************** BILL TEXT (EMOJIS KEPT) **************/
function buildBillText() {
  const name = document.getElementById("custName").value.trim();
  const date = new Date(currentBillDate || new Date()).toLocaleString();
  const total = document.getElementById("grandTotalText").textContent;

  let text = `🧾 RUCHI KIRANA SHOP - Bill\n`;
  text += `📅 Date: ${date}\n`;
  text += `👤 Customer: ${name}\n`;
  text += "---------------------\n";

  Object.keys(cart).forEach(id => {
    const p = products.find(x => x.id == id);
    if (!p) return;
    text += `${p.name} × ${cart[id]} = ₹${p.price * cart[id]}\n`;
  });

  text += "---------------------\n";
  text += `💰 TOTAL: ${total}\n`;
  text += `🙏 Thank you! Visit Again`;

  return text;
}

/************** SAVE HISTORY **************/
function saveBillToHistory() {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    id: Date.now(),
    text: buildBillText(),
    date: new Date().toISOString()
  });
  localStorage.setItem("bills", JSON.stringify(bills));
}

/************** ✅ TEXT-ONLY SHARE (FINAL FIX) **************/
function shareImage() {
  if (!validateCustomerName()) return;

  const text = buildBillText();
  saveBillToHistory();

  if (navigator.share) {
    navigator.share({
      title: "Bill - Ruchi Kirana Shop",
      text: text
    }).catch(() => shareToWhatsAppText());
  } else {
    shareToWhatsAppText();
  }
}

/************** WHATSAPP TEXT **************/
function shareToWhatsAppText() {
  const text = encodeURIComponent(buildBillText());
  window.open("https://wa.me/?text=" + text, "_blank");
}

/************** INIT **************/
renderCategoryTabs();
renderProducts();
renderBill();

/************** EXPORT **************/
window.shareImage = shareImage;
window.shareToWhatsAppText = shareToWhatsAppText;
