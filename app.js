// ---------- app.js ----------
const SELLER_WHATSAPP = "8262871647"; 

let cart = {};
const PRODUCTS_MAP = {};
PRODUCTS.forEach(p => (PRODUCTS_MAP[p.id] = p));

function renderCategories() {
  const cats = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
  const cont = document.getElementById("categoryScroll");
  cont.innerHTML = "";
  const all = makeBubble("All");
  cont.appendChild(all);
  cats.forEach(c => cont.appendChild(makeBubble(c)));
}

function makeBubble(name) {
  const b = document.createElement("button");
  b.textContent = name;
  b.className = "category-bubble";
  b.onclick = () => {
    document.querySelectorAll(".category-bubble").forEach(x => x.classList.remove("selected"));
    b.classList.add("selected");
    window.selectedCategory = name === "All" ? null : name;
    renderProducts();
  };
  return b;
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  const q = document.getElementById("searchInput").value.toLowerCase();
  const sel = window.selectedCategory || null;
  const filtered = PRODUCTS.filter(p => {
    if (sel && p.category !== sel) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });
  // ✅ Sort products by price ascending if "All" category is selected
  if (!sel) {
    filtered.sort((a, b) => a.price - b.price);
  }


  if (filtered.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:#777;">No products found.</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = p.image || "/firecracker.webp";
    img.alt = p.name;

    const h = document.createElement("h3");
    h.textContent = p.name;

    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = p.description || "";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <span>Brand: ${p.brand}</span>
      <span>₹${p.price}</span>
      <span>${p.quantity ? p.quantity : ""}</span>
    `;

    const qtyRow = document.createElement("div");
    qtyRow.className = "qty-row";

    const minus = document.createElement("button");
    minus.textContent = "−";
    const qtySpan = document.createElement("span");
    qtySpan.textContent = cart[p.id] || 0;
    const plus = document.createElement("button");
    plus.textContent = "+";

    minus.onclick = () => {
      if (cart[p.id] > 0) {
        cart[p.id]--;
        if (cart[p.id] === 0) delete cart[p.id];
        updateCart();
        renderProducts();
      }
    };

    plus.onclick = () => {
      cart[p.id] = (cart[p.id] || 0) + 1;
      updateCart();
      renderProducts();
    };

    qtyRow.append(minus, qtySpan, plus);
    card.append(img, h, desc, meta, qtyRow);
    grid.appendChild(card);
  });
}

function updateCart() {
  const items = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = Object.entries(cart).reduce(
    (t, [id, q]) => t + PRODUCTS_MAP[id].price * q,
    0
  );

  let summary = document.getElementById("cartSummary");
  summary.textContent = `🛒 Items: ${items} | Total: ₹${subtotal}`;

  // warning message element check/create
  let warning = document.getElementById("checkoutWarning");
  if (!warning) {
    warning = document.createElement("div");
    warning.id = "checkoutWarning";
    warning.className = "checkout-warning";
    summary.parentElement.appendChild(warning);
  }
  warning.style.display = "none";
}

function openCheckout() {
  const subtotal = Object.entries(cart).reduce(
    (t, [id, q]) => t + PRODUCTS_MAP[id].price * q,
    0
  );

  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty!");
    return;
  }

  if (subtotal < 500) {
    const warning = document.getElementById("checkoutWarning");
    if (warning) {
      warning.textContent = "⚠️ Minimum order value is ₹500 for delivery.";
      warning.style.display = "block";
    }
    return;
  }

  // hide warning if valid
  const warning = document.getElementById("checkoutWarning");
  if (warning) warning.style.display = "none";

  document.getElementById("checkoutModal").classList.remove("hidden");
  renderOrderSummary();
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
}

function renderOrderSummary() {
  const tbody = document.getElementById("orderBody");
  tbody.innerHTML = "";
  let subtotal = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const p = PRODUCTS_MAP[id];
    if (!p) return;
    const itemTotal = p.price * qty;
    subtotal += itemTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td style="text-align:center">${qty}</td>
      <td style="text-align:right">₹${p.price}</td>
      <td style="text-align:right">₹${itemTotal}</td>
    `;
    tbody.appendChild(tr);
  });

  const discount = Math.round(subtotal * 0.1);
  const finalTotal = subtotal - discount;

  document.getElementById("subtotalAmount").textContent = subtotal;
  document.getElementById("discountAmount").textContent = discount;
  document.getElementById("finalTotal").textContent = finalTotal;
}


function init() {
  renderCategories();
  renderProducts();
  document.getElementById("searchInput").oninput = renderProducts;
  document.getElementById("openCart").onclick = openCheckout;
  document.getElementById("cancelCheckout").onclick = closeCheckout;

  document.getElementById("checkoutForm").onsubmit = e => {
    e.preventDefault();

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const addr = document.getElementById("custAddress").value.trim();
    const subtotal = Number(document.getElementById("subtotalAmount").textContent);
    const discount = Number(document.getElementById("discountAmount").textContent);
    const total = Number(document.getElementById("finalTotal").textContent);

const msg = `✨🪔 *🎉 New Diwali Order Alert 🎉* 🪔✨

👤 *Customer:* ${name}
📞 *Mobile:* ${phone}
🏠 *Address:* ${addr}

🎆 *Ordered Items:* 
${Object.entries(cart).map(([id, qty], index) => {
  const p = PRODUCTS_MAP[id];
  const lineTotal = p.price * qty;
  return `${index + 1}. ${p.name} | ${qty} pcs × ₹${p.price} = ₹${lineTotal}`;
}).join("\n")}

------------------------------------
🧮 *Total Items:* ${Object.values(cart).reduce((a, b) => a + b, 0)} pcs
💰 *Subtotal:* ₹${subtotal}
🎁 *Festival Discount (10%):* ₹${discount}
✅ *Final Payable Amount:* ₹${total}

💥 *Wishing you and your family a Very Happy & Safe Diwali!* 💥`;


const link = `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(msg)}`;
window.open(link, "_blank");

cart = {};
updateCart();
closeCheckout();

  };
}

document.addEventListener("DOMContentLoaded", init);
