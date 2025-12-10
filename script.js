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
  const name = document.getElementById("custName").value.trim();
  const drawerName = document.getElementById("custNameDrawer").value.trim();

  const err1 = document.getElementById("nameError");
  const err2 = document.getElementById("nameErrorDrawer");

  if (name === "" || drawerName === "") {
    if (showError) {
      err1.style.display = "block";
      err2.style.display = "block";
    }
    return false;
  }

  err1.style.display = "none";
  err2.style.display = "none";
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
    alert("Please enter customer name first.");
    return;
  }

  const before = getTotalItems();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];

  const after = getTotalItems();

  if (before === 0 && after > 0) {
    currentBillDate = new Date();
    document.getElementById("billingDate").textContent = formatDateTime(currentBillDate);
    showDrawer();
  } else if (after === 0) {
    clearCart();
    return;
  } else {
    showDrawer();
  }

  renderProducts();
  renderBill();
}

/************** DRAWER **************/
function showDrawer() {
  document.getElementById("cartDrawer").classList.remove("hidden");
}

function toggleDrawer() {
  if (!validateCustomerName()) return;
  if (getTotalItems() === 0) return;

  drawerOpen = !drawerOpen;
  const body = document.getElementById("drawerBody");

  body.style.display = drawerOpen ? "block" : "none";
  document.getElementById("drawerToggleIcon").textContent = drawerOpen ? "▼" : "▲";
}

function hideDrawer() {
  document.getElementById("cartDrawer").classList.add("hidden");
  drawerOpen = false;
}

/************** RENDER BILL **************/
function renderBill() {
  const tbody = document.getElementById("billBody");
  tbody.innerHTML = "";

  let total = 0, items = 0;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    const qty = cart[id];
    const lineTotal = qty * p.price;

    total += lineTotal;
    items += qty;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td style="text-align:center;">${qty}</td>
      <td class="amount">₹${lineTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById("grandTotalText").textContent = "₹" + total.toFixed(2);
  document.getElementById("drawerTotal").textContent = "₹" + total.toFixed(2);
  document.getElementById("drawerItems").textContent =
    items + " item" + (items !== 1 ? "s selected" : "");
}

/************** CLEAR CART **************/
function clearCart() {
  cart = {};
  currentBillDate = null;

  document.getElementById("billingDate").textContent = "—";
  document.getElementById("billBody").innerHTML = "";
  document.getElementById("grandTotalText").textContent = "₹0";

  hideDrawer();
  renderProducts();
}

/************** SYNC NAMES **************/
document.getElementById("custName").addEventListener("input", () => {
  document.getElementById("custNameDrawer").value =
    document.getElementById("custName").value.trim();
  validateCustomerName(false);
});

document.getElementById("custNameDrawer").addEventListener("input", () => {
  document.getElementById("custName").value =
    document.getElementById("custNameDrawer").value.trim();
  validateCustomerName(false);
});

/************** HELPERS **************/
function getTotalItems() {
  let n = 0;
  for (let id in cart) n += cart[id];
  return n;
}

function formatDateTime(dt) {
  if (!dt) return "—";
  return dt.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/************** BUILD BILL TEXT **************/
function buildBillText() {
  const name = document.getElementById("custName").value.trim();
  const total = document.getElementById("grandTotalText").textContent;
  const date = formatDateTime(currentBillDate || new Date());

  let text = `Ruchi Kirana Shop - Bill\n`;
  text += `Date: ${date}\nCustomer: ${name}\n---------------------\n`;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    text += `${p.name} × ${cart[id]} = ₹${(p.price * cart[id]).toFixed(2)}\n`;
  }

  text += `---------------------\nTOTAL: ${total}\n`;
  return text;
}

/************** SHARE TEXT (native share sheet) **************/
async function shareBill() {
  if (!validateCustomerName()) return alert("Enter customer name first.");

  const text = buildBillText();

  if (navigator.share) {
    try {
      return await navigator.share({
        title: "Bill",
        text: text
      });
    } catch (err) {
      console.log(err);
    }
  }

  alert(text);
}

/************** SAVE BILL **************/
function saveBill() {
  if (!validateCustomerName()) return alert("Enter customer name.");

  const bills = JSON.parse(localStorage.getItem("bills") || "[]");

  bills.push({
    id: Date.now(),
    date: new Date().toISOString(),
    customerName: document.getElementById("custName").value.trim(),
    cart: { ...cart },
    total: document.getElementById("grandTotalText").textContent
  });

  localStorage.setItem("bills", JSON.stringify(bills));
  alert("Bill saved!");
  renderHistory();
}

/************** HISTORY **************/
function renderHistory() {
  const list = document.getElementById("historyList");
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");

  if (bills.length === 0) {
    list.innerHTML = "No bills saved.";
    return;
  }

  list.innerHTML = "";

  bills.slice().reverse().forEach(bill => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <b>${bill.customerName || "Unnamed Customer"}</b><br>
      <span style="color:#6b7280;font-size:12px;">${new Date(bill.date).toLocaleString()}</span><br>
      <b>${bill.total}</b><br>
      <button onclick="deleteBill(${bill.id})" 
        style="margin-top:6px;padding:4px 6px;border:0;background:#ef4444;
        color:white;border-radius:4px;font-size:12px;">Delete</button>
    `;

    list.appendChild(div);
  });
}

function deleteBill(id) {
  let bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills = bills.filter(b => b.id !== id);
  localStorage.setItem("bills", JSON.stringify(bills));
  renderHistory();
}

function clearHistory() {
  if (confirm("Delete all bills?")) {
    localStorage.removeItem("bills");
    renderHistory();
  }
}

/************** ADMIN **************/
function renderAdmin() {
  const table = document.getElementById("adminTable");
  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Category</th>
      <th>Price</th>
      <th>Active</th>
    </tr>
  `;

  products.forEach((p, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input type="text" value="${p.name}" onchange="editProduct(${i}, 'name', this.value)"></td>
      <td><input type="text" value="${p.category}" onchange="editProduct(${i}, 'category', this.value)"></td>
      <td><input type="number" value="${p.price}" onchange="editProduct(${i}, 'price', this.value)" min="0"></td>
      <td style="text-align:center;"><input type="checkbox" ${p.active ? "checked" : ""} 
           onchange="editProduct(${i}, 'active', this.checked)"></td>
    `;
    table.appendChild(tr);
  });
}

function editProduct(index, field, val) {
  if (field === "price") products[index].price = Number(val) || 0;
  else if (field === "active") products[index].active = val ? true : false;
  else products[index][field] = val;

  normalizeProducts();
  renderCategoryTabs();
  renderProducts();
  renderBill();
}

function addProduct() {
  const name = document.getElementById("pName").value.trim();
  const cat = document.getElementById("pCategory").value.trim();
  const price = Number(document.getElementById("pPrice").value);

  if (!name) return alert("Product name required.");
  if (isNaN(price) || price < 0) return alert("Enter valid price.");

  products.push({
    id: Date.now(),
    name,
    category: cat || "General",
    price,
    active: document.getElementById("pActive").checked
  });

  normalizeProducts();
  renderAdmin();
  renderCategoryTabs();
  renderProducts();

  document.getElementById("pName").value = "";
  document.getElementById("pCategory").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pActive").checked = true;
}

function saveProducts() {
  normalizeProducts();
  alert("Products saved.");
}

/************** TABS **************/
const customerTab = document.getElementById("customerTab");
const adminTab = document.getElementById("adminTab");
const historyTab = document.getElementById("historyTab");

const customerSection = document.getElementById("customerSection");
const adminSection = document.getElementById("adminSection");
const historySection = document.getElementById("historySection");

customerTab.onclick = () => {
  customerSection.style.display = "block";
  adminSection.style.display = "none";
  historySection.style.display = "none";

  customerTab.classList.add("active");
  adminTab.classList.remove("active");
  historyTab.classList.remove("active");
};

adminTab.onclick = () => {
  if (!adminUnlocked) {
    const pin = prompt("Enter Admin PIN (default 1234)");
    if (pin !== ADMIN_PIN) return alert("Incorrect PIN.");
    adminUnlocked = true;
    alert("Admin unlocked.");
  }

  adminSection.style.display = "block";
  customerSection.style.display = "none";
  historySection.style.display = "none";

  adminTab.classList.add("active");
  customerTab.classList.remove("active");
  historyTab.classList.remove("active");
};

historyTab.onclick = () => {
  historySection.style.display = "block";
  adminSection.style.display = "none";
  customerSection.style.display = "none";

  historyTab.classList.add("active");
  adminTab.classList.remove("active");
  customerTab.classList.remove("active");

  renderHistory();
};

/************** INITIAL RENDERS **************/
renderCategoryTabs();
renderProducts();
renderBill();
renderAdmin();
renderHistory();

/* ---------------------------------------------------------
   IMAGE GENERATION + SAVE + WHATSAPP SHARE
----------------------------------------------------------*/

// HTML content for bill image
function generateBillHTML() {
  let html = `<div style='padding:20px;font-family:sans-serif;border:1px solid #ccc;width:300px;background:white;'>`;
  html += `<h2>🛒 Ruchi Kirana Shop</h2>`;
  html += `<p>Date: ${formatDateTime(currentBillDate || new Date())}</p>`;
  html += `<p>Customer: ${document.getElementById("custName").value}</p>`;
  html += `<hr>`;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    html += `<p>${p.name} × ${cart[id]} — ₹${(p.price * cart[id]).toFixed(2)}</p>`;
  }

  html += `<hr><h3>Total: ${document.getElementById("grandTotalText").textContent}</h3>`;
  html += `</div>`;
  return html;
}

// Generate PNG
async function generateBillImage() {
  if (!validateCustomerName()) return alert("Enter customer name first.");

  const billDiv = document.getElementById("billPreview");
  billDiv.innerHTML = generateBillHTML();
  billDiv.style.display = "block";

  try {
    const canvas = await html2canvas(billDiv, { scale: 2 });
    billDiv.style.display = "none";
    return canvas.toDataURL("image/png");
  } catch (err) {
    billDiv.style.display = "none";
    alert("Image creation failed.");
    throw err;
  }
}

// Save (Android 11 compatible)
async function downloadImage() {
  if (!validateCustomerName()) return alert("Enter customer name before saving.");

  let img;
  try {
    img = await generateBillImage();
  } catch {
    return;
  }

  const link = document.createElement("a");
  link.href = img;
  link.download = `Bill_${Date.now()}.png`;
  link.click();
}

// WhatsApp share text only (works on all phones)
function shareToWhatsApp() {
  if (!validateCustomerName()) return alert("Enter customer name first.");

  const text = encodeURIComponent(buildBillText());
  const url = "https://wa.me/?text=" + text;

  window.open(url, "_blank");
}
