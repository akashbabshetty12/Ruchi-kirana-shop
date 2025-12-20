/**************** INITIAL DATA ****************/
let products = JSON.parse(localStorage.getItem("products")) || [
 { id: 1, name: "Gold Flake", category: "Cigarette", price: 60, active: true },
 { id: 2, name: "Bristol", category: "Cigarette", price: 140, active: true },
 { id: 3, name: "Gold Flake king", category: "Cigarette", price: 50, active: true },
 { id: 4, name: "Gold Flake Lites", category: "Cigarette", price: 20, active: true },
 { id: 5, name: "Players", category: "Cigarette", price: 35, active: true },
 { id: 6, name: "Indiment", category: "Cigarette", price: 140, active: true },
 { id: 7, name: "Garam", category: "Cigarette", price: 50, active: true },
 { id: 8, name: "Black", category: "Cigarette", price: 20, active: true }
];

let cart = {};
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

/**************** ADMIN PIN ****************/
let savedAdminPin = localStorage.getItem("adminPin");

function requestAdminPin() {
  if (!savedAdminPin) {
    const pin = prompt("Set new Admin PIN:");
    if (!pin) return false;
    localStorage.setItem("adminPin", pin);
    savedAdminPin = pin;
    alert("Admin PIN created");
    return true;
  }
  return prompt("Enter Admin PIN:") === savedAdminPin;
}

/**************** NORMALIZE ****************/
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

/**************** CUSTOMER NAME ****************/
function validateCustomerName(show = true) {
  const n1 = document.getElementById("custName");
  const n2 = document.getElementById("custNameDrawer");
  const name = n1?.value.trim() || "";
  const dname = n2?.value.trim() || "";

  if (!name || !dname) {
    if (show) alert("Please enter customer name first.");
    return false;
  }
  return true;
}

/**************** CATEGORY ****************/
function getCategories() {
  return [...new Set(products.filter(p => p.active).map(p => p.category))];
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
    const b = document.createElement("button");
    b.className = "catTab" + (selectedCategory === cat ? " active" : "");
    b.textContent = cat;
    b.onclick = () => {
      selectedCategory = cat;
      renderCategoryTabs();
      renderProducts();
    };
    wrap.appendChild(b);
  });
}

/**************** PRODUCTS ****************/
function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;
  list.innerHTML = "";

  products
    .filter(p => p.active && (selectedCategory === "All" || p.category === selectedCategory))
    .forEach(p => {
      const qty = cart[p.id] || 0;
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-cat">${p.category}</div>
          <div class="product-price">₹${p.price}</div>
        </div>
        <div class="qty">
          <button onclick="updateQty(${p.id},-1)">−</button>
          <span>${qty}</span>
          <button class="plus" onclick="updateQty(${p.id},1)">+</button>
        </div>`;
      list.appendChild(div);
    });
}

/**************** QTY ****************/
function updateQty(id, delta) {
  if (!validateCustomerName()) return;

  const before = getTotalItems();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  const after = getTotalItems();

  if (before === 0 && after > 0) {
    currentBillDate = new Date();
    document.getElementById("billingDate").textContent = formatDateTime(currentBillDate);
    showDrawer();
  }
  if (after === 0) clearCart();

  renderProducts();
  renderBill();
}

/**************** DRAWER ****************/
function showDrawer() {
  document.getElementById("cartDrawer")?.classList.remove("hidden");
}
function hideDrawer() {
  document.getElementById("cartDrawer")?.classList.add("hidden");
  drawerOpen = false;
}

/**************** BILL ****************/
function renderBill() {
  const tbody = document.getElementById("billBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let total = 0, items = 0;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    if (!p) continue;
    const qty = cart[id];
    const amt = qty * p.price;
    total += amt;
    items += qty;

    tbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td style="text-align:center">${qty}</td>
        <td class="amount">₹${amt.toFixed(2)}</td>
      </tr>`;
  }

  document.getElementById("grandTotalText").textContent = "₹" + total.toFixed(2);
  document.getElementById("drawerTotal").textContent = "₹" + total.toFixed(2);
  document.getElementById("drawerItems").textContent = items + " item(s)";
}

/**************** CLEAR ****************/
function clearCart() {
  cart = {};
  currentBillDate = null;
  document.getElementById("billBody").innerHTML = "";
  document.getElementById("grandTotalText").textContent = "₹0";
  document.getElementById("billingDate").textContent = "—";
  hideDrawer();
  renderProducts();
}

/**************** HELPERS ****************/
function getTotalItems() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function formatDateTime(dt) {
  if (!dt) return "—";
  return dt.toLocaleString();
}

/**************** HISTORY ****************/
function saveBillToHistory() {
  let bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    id: Date.now(),
    date: new Date().toISOString(),
    customer: document.getElementById("custName").value,
    cart: { ...cart },
    total: document.getElementById("grandTotalText").textContent
  });
  localStorage.setItem("bills", JSON.stringify(bills));
}

function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  list.innerHTML = bills.length ? "" : "No bills saved.";

  bills.slice().reverse().forEach(b => {
    const d = document.createElement("div");
    d.className = "history-item";
    d.innerHTML = `
      <b>${b.customer}</b><br>
      <small>${new Date(b.date).toLocaleString()}</small><br>
      <b>${b.total}</b>
      <button onclick="recreateBill(${b.id})">Load</button>
      <button onclick="deleteBill(${b.id})">Delete</button>`;
    list.appendChild(d);
  });
}

function deleteBill(id) {
  let bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills = bills.filter(b => b.id !== id);
  localStorage.setItem("bills", JSON.stringify(bills));
  renderHistory();
}

function recreateBill(id) {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  const b = bills.find(x => x.id === id);
  if (!b) return;
  cart = { ...b.cart };
  currentBillDate = new Date(b.date);
  document.getElementById("custName").value = b.customer;
  document.getElementById("custNameDrawer").value = b.customer;
  document.getElementById("billingDate").textContent = formatDateTime(currentBillDate);
  renderProducts();
  renderBill();
  showDrawer();
}

/**************** IRCTC STYLE SAVE (PDF) ****************/
function saveBillPDF() {
  if (!validateCustomerName()) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10, total = 0;

  doc.text("Ruchi Kirana Shop", 10, y); y += 8;
  doc.text(`Customer: ${custName.value}`, 10, y); y += 6;
  doc.text(`Date: ${formatDateTime(currentBillDate || new Date())}`, 10, y); y += 8;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    const amt = p.price * cart[id];
    total += amt;
    doc.text(`${p.name} x ${cart[id]} = ₹${amt}`, 10, y);
    y += 6;
  }

  doc.text(`TOTAL: ₹${total}`, 10, y + 4);
  doc.save(`Ruchi_Bill_${Date.now()}.pdf`);
  saveBillToHistory();
  alert("Bill saved successfully");
}

/**************** IRCTC STYLE SHARE (PDF) ****************/
async function shareBillPDF() {
  if (!validateCustomerName()) return;
  if (!navigator.canShare) return alert("Share not supported");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10, total = 0;

  doc.text("Ruchi Kirana Shop", 10, y); y += 8;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    const amt = p.price * cart[id];
    total += amt;
    doc.text(`${p.name} x ${cart[id]} ₹${amt}`, 10, y);
    y += 6;
  }

  doc.text(`TOTAL: ₹${total}`, 10, y + 6);

  const file = new File([doc.output("blob")], "Ruchi_Bill.pdf", { type: "application/pdf" });
  await navigator.share({ title: "Ruchi Bill", files: [file] });
}

/**************** INIT ****************/
renderCategoryTabs();
renderProducts();
renderBill();
renderHistory();
