/************** INITIAL DATA **************/
let products = JSON.parse(localStorage.getItem("products")) || [
 { id: 1, name: "Gold Flake", category: "Cigarette", price: 60, active: true },
 { id: 2, name: "Bristol", category: "Cigarette", price: 140, active: true },
 { id: 3, name: "Gold Flake king", category: "Cigarette", price: 50, active: true },
 { id: 4, name: "Gold Flake Lites", category: "Cigarette", price: 20, active: true },
 { id: 5, name: "Players", category: "Cigarette", price: 35, active: true },
 { id: 6, name: "Indiment", category: "Cigarette", price: 140, active: true },
 { id: 7, name: "Garam", category: "Cigarette", price: 50, active: true },
 { id: 8, name: "Black", category: "Cigarette", price: 20, active: true },
 { id: 9, name: "Ganesh", category: "Cigarette", price: 35, active: true },
 { id: 10, name: "Mahesh", category: "Cigarette", price: 140, active: true },
 { id: 11, name: "100 Bidi", category: "Cigarette", price: 50, active: true },
 { id: 12, name: "Vimal", category: "Pan Masala", price: 20, active: true },
 { id: 13, name: "RR", category: "Pan Masala", price: 35, active: true },
 { id: 14, name: "Super", category: "Pan Masala", price: 140, active: true },
 { id: 15, name: "Baba", category: "Pan Masala", price: 50, active: true },
 { id: 16, name: "RMD B(1 Pc)", category: "Pan Masala", price: 20, active: true },
 { id: 17, name: "RMD S(1 Pc)", category: "Pan Masala", price: 35, active: true },
 { id: 18, name: "Elichi", category: "Pan Masala", price: 50, active: true },
 { id: 19, name: "7 star", category: "Pan Masala", price: 20, active: true },
 { id: 20, name: "sony", category: "Pan Masala", price: 35, active: true },
 { id: 21, name: "chali adki", category: "Pan Masala", price: 50, active: true },
 { id: 22, name: "Dal", category: "Pan Masala", price: 20, active: true },
 { id: 23, name: "Raju", category: "Pan Masala", price: 35, active: true },
 { id: 24, name: "Sazan", category: "Pan Masala", price: 20, active: true },
 { id: 25, name: "Patanjali", category: "Biscuits", price: 35, active: true },
 { id: 26, name: "Krackjack", category: "Biscuits", price: 35, active: true },
 { id: 27, name: "Bourbon Dark", category: "Biscuits", price: 35, active: true },
 { id: 28, name: "20-20", category: "Biscuits", price: 35, active: true },
 { id: 29, name: "Good Day", category: "Biscuits", price: 35, active: true },
 { id: 30, name: "Parle-Gold", category: "Biscuits", price: 35, active: true },
 { id: 31, name: "Marie Gold", category: "Biscuits", price: 35, active: true },
 { id: 32, name: "Happy Happy", category: "Biscuits", price: 35, active: true },
 { id: 33, name: "Monnacco", category: "Biscuits", price: 35, active: true },
 { id: 34, name: "Hide & Seek", category: "Biscuits", price: 35, active: true },
 { id: 35, name: "Bourbon", category: "Biscuits", price: 35, active: true },
 { id: 36, name: "Jim Jam", category: "Biscuits", price: 35, active: true },
 { id: 37, name: "Dark Fantasy", category: "Biscuits", price: 35, active: true },
 { id: 38, name: "Oreo", category: "Biscuits", price: 35, active: true }
];

let cart = {};
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

/************** DEVICE-BASED ADMIN PIN (ALWAYS ASK) **************/
let savedAdminPin = localStorage.getItem("adminPin");

function requestAdminPin() {
  // FIRST TIME → CREATE PIN
  if (!savedAdminPin) {
    const newPin = prompt("Set new Admin PIN:");
    if (!newPin || newPin.trim() === "") {
      alert("PIN not set.");
      return false;
    }
    localStorage.setItem("adminPin", newPin);
    savedAdminPin = newPin;
    alert("Admin PIN created successfully!");
    return true;
  }

  // EVERY TIME → ASK FOR PIN
  const entered = prompt("Enter Admin PIN:");
  if (entered === savedAdminPin) {
    return true;
  }

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
    alert("Please enter customer name first.");
    return;
  }

  const before = getTotalItems();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];

  const after = getTotalItems();

  if (before === 0 && after > 0) {
    currentBillDate = new Date();
    const dtElem = document.getElementById("billingDate");
    if (dtElem) dtElem.textContent = formatDateTime(currentBillDate);
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
  const drawer = document.getElementById("cartDrawer");
  if (drawer) drawer.classList.remove("hidden");
}

function toggleDrawer() {
  if (!validateCustomerName()) return;
  if (getTotalItems() === 0) return;

  drawerOpen = !drawerOpen;
  const body = document.getElementById("drawerBody");

  if (body) body.style.display = drawerOpen ? "block" : "none";
  const icon = document.getElementById("drawerToggleIcon");
  if (icon) icon.textContent = drawerOpen ? "▼" : "▲";
}

function hideDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (drawer) drawer.classList.add("hidden");
  drawerOpen = false;
}

/************** RENDER BILL **************/
function renderBill() {
  const tbody = document.getElementById("billBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let total = 0, items = 0;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    if (!p) continue;
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

  const grandTotalText = document.getElementById("grandTotalText");
  const drawerTotal = document.getElementById("drawerTotal");
  const drawerItems = document.getElementById("drawerItems");

  if (grandTotalText) grandTotalText.textContent = "₹" + total.toFixed(2);
  if (drawerTotal) drawerTotal.textContent = "₹" + total.toFixed(2);
  if (drawerItems) drawerItems.textContent = items + " item" + (items !== 1 ? "s" : "") + " selected";
}

/************** CLEAR CART **************/
function clearCart() {
  cart = {};
  currentBillDate = null;

  const billingDate = document.getElementById("billingDate");
  if (billingDate) billingDate.textContent = "—";

  const billBody = document.getElementById("billBody");
  if (billBody) billBody.innerHTML = "";

  const grandTotalText = document.getElementById("grandTotalText");
  if (grandTotalText) grandTotalText.textContent = "₹0";

  hideDrawer();
  renderProducts();
}

/************** SYNC NAMES **************/
const custNameElem = document.getElementById("custName");
const custNameDrawerElem = document.getElementById("custNameDrawer");

if (custNameElem) {
  custNameElem.addEventListener("input", () => {
    if (custNameDrawerElem) custNameDrawerElem.value = custNameElem.value.trim();
    validateCustomerName(false);
  });
}

if (custNameDrawerElem) {
  custNameDrawerElem.addEventListener("input", () => {
    if (custNameElem) custNameElem.value = custNameDrawerElem.value.trim();
    validateCustomerName(false);
  });
}

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

/************** BILL TEXT FOR WHATSAPP **************/
function buildBillText() {
  const name = (document.getElementById("custName")?.value || "").trim();
  const total = document.getElementById("grandTotalText")?.textContent || "₹0";
  const date = formatDateTime(currentBillDate || new Date());

  let text = `🧾 *RUCHI KIRANA SHOP* - Bill\n`;
  text += `📅 Date: ${date}\n 👤 Customer: ${name}\n---------------------\n`;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    if (!p) continue;
    text += `${p.name} × ${cart[id]} = ₹${(p.price * cart[id]).toFixed(2)}\n`;
  }

  text += `---------------------\n 💰 TOTAL: ${total}\n`;
  text = `🙏 Thank you! Visit Again\n`;
  return text;
}

/************** SAVE BILL HISTORY **************/
function saveBillToHistory() {
  if (!validateCustomerName()) return alert("Enter customer name.");

  const bills = JSON.parse(localStorage.getItem("bills") || "[]");

  bills.push({
    id: Date.now(),
    date: new Date().toISOString(),
    customerName: document.getElementById("custName")?.value.trim() || "Unnamed",
    cart: { ...cart },
    total: document.getElementById("grandTotalText")?.textContent || "₹0"
  });

  localStorage.setItem("bills", JSON.stringify(bills));
  renderHistory();
}

/************** HISTORY **************/
function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");

  if (bills.length === 0) {
    list.innerHTML = "No bills saved.";
    return;
  }

  list.innerHTML = "";

  bills.slice().reverse().forEach(bill => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.style.padding = "8px 0";
    div.style.borderBottom = "1px solid #eee";

    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <b>${bill.customerName || "Unnamed Customer"}</b><br>
          <span style="color:#6b7280;font-size:12px;">${new Date(bill.date).toLocaleString()}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:bold">${bill.total}</div>
          <div style="margin-top:6px;">
            <button onclick="deleteBill(${bill.id})" style="padding:6px;border-radius:6px;border:0;background:#ef4444;color:white;margin-right:6px;">Delete</button>
            <button onclick="recreateBill(${bill.id})" style="padding:6px;border-radius:6px;border:0;background:#2563eb;color:white;">Load</button>
          </div>
        </div>
      </div>
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

function recreateBill(id) {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  const bill = bills.find(b => b.id === id);
  if (!bill) return alert("Bill not found.");

  cart = { ...bill.cart };
  if (bill.date) currentBillDate = new Date(bill.date);
  else currentBillDate = new Date();

  document.getElementById("custName").value = bill.customerName || "";
  document.getElementById("custNameDrawer").value = bill.customerName || "";
  document.getElementById("billingDate").textContent = formatDateTime(currentBillDate);

  renderProducts();
  renderBill();
  showDrawer();
}

/************** ADMIN SECTION RENDER **************/
function renderAdmin() {
  const table = document.getElementById("adminTable");
  if (!table) return;
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
      <td style="text-align:center;"><input type="checkbox" ${p.active ? "checked" : ""} onchange="editProduct(${i}, 'active', this.checked)"></td>
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
  const name = (document.getElementById("pName")?.value || "").trim();
  const cat = (document.getElementById("pCategory")?.value || "").trim();
  const price = Number(document.getElementById("pPrice")?.value || 0);

  if (!name) return alert("Product name required.");
  if (isNaN(price) || price < 0) return alert("Enter valid price.");

  products.push({
    id: Date.now(),
    name,
    category: cat || "General",
    price,
    active: document.getElementById("pActive")?.checked ?? true
  });

  normalizeProducts();
  renderAdmin();
  renderCategoryTabs();
  renderProducts();

  if (document.getElementById("pName")) document.getElementById("pName").value = "";
  if (document.getElementById("pCategory")) document.getElementById("pCategory").value = "";
  if (document.getElementById("pPrice")) document.getElementById("pPrice").value = "";
  if (document.getElementById("pActive")) document.getElementById("pActive").checked = true;
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

/*** CUSTOMER TAB ***/
if (customerTab) {
  customerTab.onclick = () => {
    if (customerSection) customerSection.style.display = "block";
    if (adminSection) adminSection.style.display = "none";
    if (historySection) historySection.style.display = "none";

    customerTab.classList.add("active");
    if (adminTab) adminTab.classList.remove("active");
    if (historyTab) historyTab.classList.remove("active");
  };
}

/*** ADMIN TAB — ALWAYS ASK PIN ***/
if (adminTab) {
  adminTab.onclick = () => {

    if (!requestAdminPin()) return;

    if (adminSection) adminSection.style.display = "block";
    if (customerSection) customerSection.style.display = "none";
    if (historySection) historySection.style.display = "none";

    adminTab.classList.add("active");
    if (customerTab) customerTab.classList.remove("active");
    if (historyTab) historyTab.classList.remove("active");

    renderAdmin();
  };
}

/*** HISTORY TAB ***/
if (historyTab) {
  historyTab.onclick = () => {
    if (historySection) historySection.style.display = "block";
    if (adminSection) adminSection.style.display = "none";
    if (customerSection) customerSection.style.display = "none";

    historyTab.classList.add("active");
    if (adminTab) adminTab.classList.remove("active");
    if (customerTab) customerTab.classList.remove("active");

    renderHistory();
  };
}

/************** INITIAL RENDERS **************/
renderCategoryTabs();
renderProducts();
renderBill();
renderAdmin();
renderHistory();

/* ---------------------------------------------------------
   IMAGE GENERATION + SAVE + WHATSAPP SHARE (FIXED)
----------------------------------------------------------*/

function generateBillHTML() {
  let html = `<div style='padding:20px;font-family:sans-serif;border:1px solid #ccc;width:320px;background:white;color:#111;'>`;
  html += `<h2 style="margin:0 0 8px 0;">🛒 Ruchi Kirana Shop</h2>`;
  html += `<div style="font-size:13px;margin-bottom:6px;">Date: ${formatDateTime(currentBillDate || new Date())}</div>`;
  html += `<div style="font-size:13px;margin-bottom:6px;">Customer: ${(document.getElementById("custName")?.value || "").trim()}</div>`;
  html += `<hr style="border:none;border-top:1px solid #eee;margin:8px 0;">`;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    if (!p) continue;
    html += `<div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0;">
               <span>${p.name} × ${cart[id]}</span>
               <strong>₹${(p.price * cart[id]).toFixed(2)}</strong>
             </div>`;
  }

  html += `<hr style="border:none;border-top:1px solid #eee;margin:8px 0;">`;
  html += `<h3 style="margin:6px 0 0 0;">Total: ${document.getElementById("grandTotalText")?.textContent || "₹0"}</h3>`;
  html += `</div>`;
  return html;
}

async function generateBillBlob() {
  if (!validateCustomerName()) throw new Error("Enter customer name first.");

  if (typeof html2canvas !== "function") {
    throw new Error("html2canvas is not loaded. Please include html2canvas library.");
  }

  const billDiv = document.getElementById("billPreview");
  if (!billDiv) throw new Error("Missing #billPreview element.");

  billDiv.innerHTML = generateBillHTML();
  billDiv.style.display = "block";

  try {
    const canvas = await html2canvas(billDiv, { scale: 2 });
    const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
    return blob;
  } finally {
    billDiv.style.display = "none";
    billDiv.innerHTML = "";
  }
}

async function downloadImage() {
  try {
    const blob = await generateBillBlob();
    saveBillToHistory();

    if (window.showSaveFilePicker) {
      try {
        const opts = {
          types: [
            {
              description: "PNG image",
              accept: { "image/png": [".png"] }
            }
          ]
        };
        const handle = await window.showSaveFilePicker(opts);
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        alert("Saved successfully.");
        return;
      } catch (err) {
        console.warn("showSaveFilePicker failed or cancelled:", err);
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bill_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    alert("Download started.");
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to save image.");
  }
}

async function shareImage() {
  try {
    const blob = await generateBillBlob();
    saveBillToHistory();

    const file = new File([blob], `Bill_${Date.now()}.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Bill - Ruchi Kirana Shop",
          text: buildBillText()
        });
        return;
      } catch (err) {
        console.warn("navigator.share with files failed:", err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: "Bill - Ruchi Kirana Shop",
          text: buildBillText()
        });
        return;
      } catch (err) {
        console.warn("navigator.share attempt failed:", err);
      }
    }

    alert("Image sharing not supported on this device. Using text fallback.");
    shareToWhatsAppText();

  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes("html2canvas")) {
      alert("Image generation failed. Make sure html2canvas library is included.");
    } else {
      alert("Sharing failed.");
    }
  }
}

function shareToWhatsAppText() {
  if (!validateCustomerName()) return alert("Enter customer name first.");
  const text = encodeURIComponent(buildBillText());
  const url = "https://wa.me/?text=" + text;
  window.open(url, "_blank", "noopener");
}

window.downloadImage = downloadImage;
window.shareImage = shareImage;
window.shareToWhatsAppText = shareToWhatsAppText;
