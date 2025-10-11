// ---------- app.js ----------
// 🪔 Sai Ashray Fire Crackers Store Logic
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
    meta.innerHTML = `<span>${p.brand}</span><span>₹${p.price}</span>`;

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
  document.getElementById("cartSummary").textContent = `🛒 Items: ${items} | Total: ₹${subtotal}`;
}

function openCheckout() {
  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty!");
    return;
  }
  document.getElementById("checkoutModal").classList.remove("hidden");
  renderOrderSummary();
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
}

function renderOrderSummary() {
  const container = document.getElementById("orderSummary");
  container.innerHTML = "";
  let subtotal = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const p = PRODUCTS_MAP[id];
    const row = document.createElement("div");
    const itemTotal = p.price * qty;
    subtotal += itemTotal;
    row.className = "order-item";
    row.textContent = `${qty} × ${p.name} — ₹${itemTotal}`;
    container.appendChild(row);
  });
  const discount = Math.round(subtotal * 0.1);
  const finalTotal = subtotal - discount;
  document.getElementById("subtotalAmount").textContent = subtotal;
  document.getElementById("discountAmount").textContent = discount;
  document.getElementById("finalTotal").textContent = finalTotal;
}

// ---------------- WhatsApp Message ----------------
function sendWhatsAppMessage(name, phone, addr, subtotal, discount, total) {
  if (!name || !phone || !addr) {
    alert("Please fill all details!");
    return;
  }

  const msg = `✨🪔 *New Diwali Order Alert...!* 🪔✨

*Customer:* ${name}
*Mobile:* ${phone}
*WhatsApp:* ${phone}
*Address:* ${addr}

🎆 *Ordered Items:* 
${Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS_MAP[id];
    const lineTotal = p.price * qty;
    return `${qty} × ${p.name} @ ₹${p.price} = ₹${lineTotal}`;
  }).join("\n")}
------------------------------------
*Subtotal:* ₹${subtotal}
*Festival Discount (10%):* ₹${discount}
*Final Payable Amount:* ₹${total}

*Thank you for choosing Sai Ashray Fire Crackers!* 
*Wish you and your family a Very Happy & Safe Diwali!* 💥`;

  const encodedMsg = encodeURIComponent(msg);
  const link = `https://wa.me/${SELLER_WHATSAPP}?text=${encodedMsg}`;
  window.open(link, "_blank");

  cart = {};
  updateCart();
  closeCheckout();
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

    sendWhatsAppMessage(name, phone, addr, subtotal, discount, total);
  };
}

document.addEventListener("DOMContentLoaded", init);
