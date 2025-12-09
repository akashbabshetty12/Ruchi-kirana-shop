/************** Config **************/
const ADMIN_PIN = "1234"; // change PIN here
let adminUnlocked = false;

/************** Data & Setup **************/
let products = JSON.parse(localStorage.getItem("products")) || [
  {id:1,name:"Rice",category:"Staples",price:60,active:true},
  {id:2,name:"Oil",category:"Oil",price:140,active:true},
  {id:3,name:"Sugar",category:"Staples",price:50,active:true},
  {id:4,name:"Biscuits",category:"Snacks",price:20,active:true},
  {id:5,name:"Cold Drink",category:"Beverages",price:35,active:true}
];

let cart = {};               
let selectedCategory = "All";
let drawerOpen = false;
let currentBillDate = null;

function normalizeProducts(){
  products = products.map(p => ({
    ...p,
    category: p.category || "General",
    active: p.active === true || p.active === "true",
    price: Number(p.price)
  }));
  localStorage.setItem("products", JSON.stringify(products));
}
normalizeProducts();

function getTotalItems(){
  let n = 0;
  for (let id in cart){ n += cart[id]; }
  return n;
}
function formatDateTime(dt){
  if (!dt) return "—";
  return dt.toLocaleString(undefined,{
    day:"2-digit", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });
}

function getCategories(){
  const set = new Set();
  products.forEach(p => { if (p.active) set.add(p.category); });
  return Array.from(set);
}
function renderCategoryTabs(){
  const wrap = document.getElementById("categoryTabs");
  wrap.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "catTab" + (selectedCategory === "All" ? " active" : "");
  allBtn.textContent = "All";
  allBtn.onclick = () => {
    selectedCategory = "All";
    renderCategoryTabs();
    renderProducts();
  };
  wrap.appendChild(allBtn);

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

function renderProducts(){
  const list = document.getElementById("productList");
  list.innerHTML = "";

  const filtered = products
    .filter(p => p.active)
    .filter(p => selectedCategory === "All" || p.category === selectedCategory);

  if (filtered.length === 0){
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
        <button onclick="updateQty(${p.id},-1)">−</button>
        <span>${qty}</span>
        <button class="plus" onclick="updateQty(${p.id},1)">+</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function updateQty(id, delta){
  const beforeItems = getTotalItems();

  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];

  const afterItems = getTotalItems();

  if (beforeItems === 0 && afterItems > 0){
    currentBillDate = new Date();
    document.getElementById("billingDate").textContent = formatDateTime(currentBillDate);
    showDrawer();
  } else if (afterItems === 0){
    clearCart();
    return;
  } else {
    showDrawer();
  }

  renderProducts();
  renderBill();
}

function showDrawer(){
  document.getElementById("cartDrawer").classList.remove("hidden");
}
function hideDrawer(){
  document.getElementById("cartDrawer").classList.add("hidden");
  drawerOpen = false;
  document.getElementById("drawerBody").style.display = "none";
  document.getElementById("drawerToggleIcon").textContent = "▲";
}

function toggleDrawer(){
  if (getTotalItems() === 0) return;
  drawerOpen = !drawerOpen;
  document.getElementById("drawerBody").style.display = drawerOpen ? "block" : "none";
  document.getElementById("drawerToggleIcon").textContent = drawerOpen ? "▼" : "▲";
}

function renderBill(){
  const tbody = document.getElementById("billBody");
  tbody.innerHTML = "";
  let total = 0;
  let items = 0;

  for (let id in cart){
    const p = products.find(pr => pr.id == id);
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

  document.getElementById("grandTotalText").textContent = "₹" + total.toFixed(2);
  document.getElementById("drawerTotal").textContent = "₹" + total.toFixed(2);
  document.getElementById("drawerItems").textContent = items + " item" + (items !== 1 ? "s selected" : "");

  document.getElementById("custNameDrawer").value = document.getElementById("custName").value;
}

function clearCart(){
  cart = {};
  currentBillDate = null;
  document.getElementById("billingDate").textContent = "—";
  document.getElementById("billBody").innerHTML = "";
  document.getElementById("grandTotalText").textContent = "₹0";
  document.getElementById("drawerTotal").textContent = "₹0";
  document.getElementById("drawerItems").textContent = "0 items selected";
  hideDrawer();
  renderProducts();
}

document.getElementById("custName").addEventListener("input", () => {
  document.getElementById("custNameDrawer").value = document.getElementById("custName").value;
});
document.getElementById("custNameDrawer").addEventListener("input", () => {
  document.getElementById("custName").value = document.getElementById("custNameDrawer").value;
});

function buildBillText(){
  const custName = document.getElementById("custName").value.trim() || "N/A";
  const totalText = document.getElementById("grandTotalText").textContent;
  const dateText = formatDateTime(currentBillDate || new Date());

  let text = `Ruchi Kirana Shop - Bill\n`;
  text += `Date: ${dateText}\n`;
  text += `Customer: ${custName}\n`;
  text += `---------------------\n`;

  for (let id in cart){
    const p = products.find(pr => pr.id == id);
    if (!p) continue;
    const qty = cart[id];
    const lineTotal = qty * p.price;
    text += `${p.name} x ${qty} = ₹${lineTotal.toFixed(2)}\n`;
  }

  text += `---------------------\n`;
  text += `TOTAL: ${totalText}\n`;
  text += `(No GST - final total only)`;
  return text;
}

function saveBill(){
  if (getTotalItems() === 0){
    alert("No items in cart to save.");
    return;
  }
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    id: Date.now(),
    date: (currentBillDate || new Date()).toISOString(),
    customerName: document.getElementById("custName").value.trim(),
    cart: {...cart},
    total: document.getElementById("grandTotalText").textContent
  });
  localStorage.setItem("bills", JSON.stringify(bills));
  alert("Bill saved!");
  renderHistory();
}

async function shareBill(){
  if (getTotalItems() === 0){
    alert("No items in cart to share.");
    return;
  }
  const text = buildBillText();

  if (navigator.share){
    try{
      await navigator.share({title:"Ruchi Kirana Shop Bill", text});
    }catch(e){
    }
  }else if (navigator.clipboard && navigator.clipboard.writeText){
    try{
      await navigator.clipboard.writeText(text);
      alert("Bill copied to clipboard.");
    }catch(e){
      alert(text);
    }
  }else{
    alert(text);
  }
}

function renderHistory(){
  const list = document.getElementById("historyList");
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");

  if (bills.length === 0){
    list.innerHTML = "No bills saved.";
    return;
  }

  list.innerHTML = "";
  bills.slice().reverse().forEach(bill => {
    const div = document.createElement("div");
    div.className = "history-item";

    const date = new Date(bill.date).toLocaleString();
    div.innerHTML = `
      <b>${bill.customerName || "Unnamed Customer"}</b><br>
      <span style="color:#6b7280;font-size:12px;">${date}</span><br>
      <b>${bill.total}</b><br>
      <button onclick="deleteBill(${bill.id})" style="margin-top:6px;padding:4px 6px;border:0;background:#ef4444;color:white;border-radius:4px;font-size:12px;">Delete</button>
    `;
    list.appendChild(div);
  });
}

function deleteBill(id){
  let bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills = bills.filter(b => b.id !== id);
  localStorage.setItem("bills", JSON.stringify(bills));
  renderHistory();
}

function clearHistory(){
  if(confirm("Delete all stored bills?")){
    localStorage.removeItem("bills");
    renderHistory();
  }
}

function renderAdmin(){
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
      <td><input type="number" min="0" step="0.01" value="${p.price}" onchange="editProduct(${i}, 'price', this.value)"></td>
      <td style="text-align:center;">
        <input type="checkbox" ${p.active ? "checked" : ""} onchange="editProduct(${i}, 'active', this.checked)">
      </td>
    `;
    table.appendChild(tr);
  });
}

function editProduct(index, field, value){
  if (field === "price"){
    products[index].price = Number(value) || 0;
  }else if (field === "active"){
    products[index].active = value ? true : false;
  }else{
    products[index][field] = value;
  }
  normalizeProducts();
  renderCategoryTabs();
  renderProducts();
  renderBill();
}

function addProduct(){
  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value.trim() || "General";
  const priceVal = document.getElementById("pPrice").value;

  if (!name){
    alert("Product name is required.");
    return;
  }
  const price = Number(priceVal);
  if (isNaN(price) || price < 0){
    alert("Enter a valid price.");
    return;
  }

  products.push({
    id: Date.now(),
    name,
    category,
    price,
    active: document.getElementById("pActive").checked
  });
  normalizeProducts();

  document.getElementById("pName").value = "";
  document.getElementById("pCategory").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pActive").checked = true;

  renderAdmin();
  renderCategoryTabs();
  renderProducts();
}

function saveProducts(){
  normalizeProducts();
  alert("Products saved.");
}

const customerTab = document.getElementById("customerTab");
const adminTab = document.getElementById("adminTab");
const historyTab = document.getElementById("historyTab");
const customerSection = document.getElementById("customerSection");
const adminSection = document.getElementById("adminSection");
const historySection = document.getElementById("historySection");

customerTab.addEventListener("click", () => {
  customerSection.style.display = "block";
  adminSection.style.display = "none";
  historySection.style.display = "none";

  customerTab.classList.add("active");
  adminTab.classList.remove("active");
  historyTab.classList.remove("active");
});

adminTab.addEventListener("click", () => {
  if (!adminUnlocked){
    const pin = prompt("Enter Admin PIN (default: 1234)");
    if (pin !== ADMIN_PIN){
      alert("Incorrect PIN.");
      return;
    }
    adminUnlocked = true;
    alert("Admin unlocked.");
  }

  adminSection.style.display = "block";
  customerSection.style.display = "none";
  historySection.style.display = "none";

  adminTab.classList.add("active");
  customerTab.classList.remove("active");
  historyTab.classList.remove("active");
});

historyTab.addEventListener("click", () => {
  historySection.style.display = "block";
  adminSection.style.display = "none";
  customerSection.style.display = "none";

  historyTab.classList.add("active");
  adminTab.classList.remove("active");
  customerTab.classList.remove("active");

  renderHistory();
});

renderCategoryTabs();
renderProducts();
renderBill();
renderAdmin();
renderHistory();
