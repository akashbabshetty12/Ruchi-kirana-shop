/**************** INITIAL DATA ****************/
let products = JSON.parse(localStorage.getItem("products")) || [
 { id: 1, name: "Gold Flake", category: "Cigarette", price: 60, active: true },
 { id: 2, name: "Bristol", category: "Cigarette", price: 140, active: true },
 { id: 3, name: "Vimal", category: "Pan Masala", price: 20, active: true },
 { id: 4, name: "Good Day", category: "Biscuits", price: 35, active: true }
];

let cart = {};
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

/**************** ADMIN PIN ****************/
let savedAdminPin = localStorage.getItem("adminPin");

function requestAdminPin() {
  if (!savedAdminPin) {
    const pin = prompt("Set Admin PIN:");
    if (!pin) return false;
    localStorage.setItem("adminPin", pin);
    savedAdminPin = pin;
    alert("Admin PIN created");
    return true;
  }
  return prompt("Enter Admin PIN:") === savedAdminPin;
}

/**************** NORMALIZE PRODUCTS ****************/
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

/**************** CUSTOMER NAME VALIDATION ****************/
/* ✅ ONLY checks main customer name */
function validateCustomerName(showError = true) {
  const name = document.getElementById("custName")?.value.trim() || "";
  if (!name) {
    if (showError) alert("Please enter customer name first.");
    return false;
  }
  return true;
}

/**************** CATEGORY TABS ****************/
function getCategories() {
  return [...new Set(products.filter(p => p.active).map(p => p.category))];
}

function renderCategoryTabs() {
  const wrap = document.getElementById("categoryTabs");
  wrap.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "All";
  allBtn.className = selectedCategory === "All" ? "active" : "";
  allBtn.onclick = () => {
    selectedCategory = "All";
    renderCategoryTabs();
    renderProducts();
  };
  wrap.appendChild(allBtn);

  getCategories().forEach(cat => {
    const b = document.createElement("button");
    b.textContent = cat;
    b.className = selectedCategory === cat ? "active" : "";
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
  list.innerHTML = "";

  products
    .filter(p => p.active && (selectedCategory === "All" || p.category === selectedCategory))
    .forEach(p => {
      const qty = cart[p.id] || 0;
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <div>
          <b>${p.name}</b><br>
          ₹${p.price}
        </div>
        <div>
          <button onclick="updateQty(${p.id},-1)">−</button>
          <span>${qty}</span>
          <button onclick="updateQty(${p.id},1)">+</button>
        </div>
      `;
      list.appendChild(div);
    });
}

/**************** UPDATE QTY (NAME REQUIRED) ****************/
function updateQty(id, delta) {
  if (!validateCustomerName()) return;

  const before = getTotalItems();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  const after = getTotalItems();

  if (before === 0 && after > 0) {
    currentBillDate = new Date();
    document.getElementById("billingDate").textContent =
      currentBillDate.toLocaleString();
    showDrawer();
  }

  if (after === 0) {
    clearCart();
    return;
  }

  renderProducts();
  renderBill();
}

/**************** DRAWER ****************/
function showDrawer() {
  document.getElementById("cartDrawer").classList.remove("hidden");
}

function toggleDrawer() {
  if (!validateCustomerName()) return;
  drawerOpen = !drawerOpen;
  document.getElementById("drawerBody").style.display =
    drawerOpen ? "block" : "none";
}

/**************** BILL ****************/
function renderBill() {
  const body = document.getElementById("billBody");
  body.innerHTML = "";

  let total = 0;
  let items = 0;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    const qty = cart[id];
    const amt = p.price * qty;
    total += amt;
    items += qty;

    body.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${qty}</td>
        <td>₹${amt}</td>
      </tr>`;
  }

  document.getElementById("grandTotalText").textContent = "₹" + total;
  document.getElementById("drawerTotal").textContent = "₹" + total;
  document.getElementById("drawerItems").textContent =
    items + " item" + (items !== 1 ? "s" : "");
}

/**************** CLEAR CART ****************/
function clearCart() {
  cart = {};
  currentBillDate = null;

  document.getElementById("billBody").innerHTML = "";
  document.getElementById("grandTotalText").textContent = "₹0";
  document.getElementById("drawerTotal").textContent = "₹0";
  document.getElementById("drawerItems").textContent = "0 items";
  document.getElementById("billingDate").textContent = "—";

  document.getElementById("cartDrawer").classList.add("hidden");
  renderProducts();
}

/**************** HELPERS ****************/
function getTotalItems() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

/**************** HISTORY ****************/
function saveBillToHistory() {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    id: Date.now(),
    customer: document.getElementById("custName").value,
    date: new Date().toISOString(),
    cart: { ...cart },
    total: document.getElementById("grandTotalText").textContent
  });
  localStorage.setItem("bills", JSON.stringify(bills));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");

  list.innerHTML = bills.length ? "" : "No bills saved.";

  bills.slice().reverse().forEach(b => {
    list.innerHTML += `
      <div style="margin-bottom:8px;">
        <b>${b.customer}</b><br>
        <small>${new Date(b.date).toLocaleString()}</small><br>
        <b>${b.total}</b>
        <button onclick="recreateBill(${b.id})">Load</button>
      </div>`;
  });
}

function recreateBill(id) {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  const b = bills.find(x => x.id === id);
  if (!b) return;

  cart = { ...b.cart };
  currentBillDate = new Date(b.date);

  document.getElementById("custName").value = b.customer;
  document.getElementById("custNameDrawer").value = b.customer;
  document.getElementById("billingDate").textContent =
    currentBillDate.toLocaleString();

  renderProducts();
  renderBill();
  showDrawer();
}

function clearHistory() {
  localStorage.removeItem("bills");
  renderHistory();
}

/**************** ADMIN ****************/
function renderAdmin() {
  const table = document.getElementById("adminTable");
  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Category</th>
      <th>Price</th>
      <th>Active</th>
    </tr>`;

  products.forEach((p, i) => {
    table.innerHTML += `
      <tr>
        <td><input value="${p.name}" onchange="editProduct(${i},'name',this.value)"></td>
        <td><input value="${p.category}" onchange="editProduct(${i},'category',this.value)"></td>
        <td><input type="number" value="${p.price}" onchange="editProduct(${i},'price',this.value)"></td>
        <td><input type="checkbox" ${p.active ? "checked" : ""} onchange="editProduct(${i},'active',this.checked)"></td>
      </tr>`;
  });
}

function editProduct(i, field, value) {
  products[i][field] = field === "price" ? Number(value) : value;
  normalizeProducts();
  renderCategoryTabs();
  renderProducts();
}

function addProduct() {
  products.push({
    id: Date.now(),
    name: pName.value,
    category: pCategory.value || "General",
    price: Number(pPrice.value),
    active: pActive.checked
  });
  normalizeProducts();
  renderAdmin();
  renderCategoryTabs();
  renderProducts();
}

function saveProducts() {
  normalizeProducts();
  alert("Products saved");
}

/**************** IRCTC STYLE SAVE (PDF) ****************/
function saveBillPDF() {
  if (!validateCustomerName()) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;
  let total = 0;

  doc.text("Ruchi Kirana Shop", 10, y); y += 8;
  doc.text(`Customer: ${custName.value}`, 10, y); y += 6;
  doc.text(`Date: ${new Date().toLocaleString()}`, 10, y); y += 8;

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
}

/**************** IRCTC STYLE SHARE (PDF) ****************/
async function shareBillPDF() {
  if (!validateCustomerName()) return;
  if (!navigator.canShare) return alert("Share not supported");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;
  let total = 0;

  for (let id in cart) {
    const p = products.find(x => x.id == id);
    const amt = p.price * cart[id];
    total += amt;
    doc.text(`${p.name} x ${cart[id]} = ₹${amt}`, 10, y);
    y += 6;
  }

  doc.text(`TOTAL: ₹${total}`, 10, y + 6);

  const file = new File(
    [doc.output("blob")],
    "Ruchi_Bill.pdf",
    { type: "application/pdf" }
  );

  await navigator.share({ files: [file] });
}

/**************** TABS ****************/
customerTab.onclick = () => {
  customerSection.style.display = "block";
  adminSection.style.display = "none";
  historySection.style.display = "none";
};

adminTab.onclick = () => {
  if (!requestAdminPin()) return;
  adminSection.style.display = "block";
  customerSection.style.display = "none";
  historySection.style.display = "none";
  renderAdmin();
};

historyTab.onclick = () => {
  historySection.style.display = "block";
  customerSection.style.display = "none";
  adminSection.style.display = "none";
  renderHistory();
};

/**************** INIT ****************/
renderCategoryTabs();
renderProducts();
renderBill();
renderHistory();
