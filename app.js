// ================================
// CONFIG — Your Google Apps Script URL
// ================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6mJOeRB16VUSSEG1Ytb1c6n2CHzOSNEayGMb-Bi02swppVMOSEAHX3Rzz6qu7u558/exec"; // replace if you redeploy

// ================================
// DATA — Products (edit freely)
// ================================
const PRODUCTS = [
  { id: 1, name: "Galaxy A15", cat: "Phones", price: 369000, img: "https://picsum.photos/seed/a15/640/480" },
  { id: 2, name: "Wireless Earbuds", cat: "Accessories", price: 45000, img: "https://picsum.photos/seed/ear/640/480" },
  { id: 3, name: "Smart Watch S2", cat: "Electronics", price: 129000, img: "https://picsum.photos/seed/watch/640/480" },
  { id: 4, name: "Men T‑Shirt", cat: "Fashion", price: 12000, img: "https://picsum.photos/seed/shirt/640/480" },
  { id: 5, name: "Power Bank 20k", cat: "Electronics", price: 38000, img: "https://picsum.photos/seed/pb/640/480" },
  { id: 6, name: "iPhone 13", cat: "Phones", price: 1150000, img: "https://picsum.photos/seed/iphone13/640/480" }
];

// ================================
// Helpers & State
// ================================
const fmt = n => `Ks ${Number(n).toLocaleString('en-US')}`;
let cart = [];

// DOM refs
const grid = document.getElementById('productsGrid');
const searchEl = document.getElementById('search');
const catEl = document.getElementById('category');
const cartBtn = document.getElementById('openCartBtn');
const cartPanel = document.getElementById('cartPanel');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const taxEl = document.getElementById('tax');
const grandEl = document.getElementById('grand');
const cartCountEl = document.getElementById('cartCount');

// Render products
function renderProducts(){
  const q = (searchEl.value || '').toLowerCase();
  const c = catEl.value;
  const items = PRODUCTS.filter(p => (c==='all'||p.cat===c) && (q===''||p.name.toLowerCase().includes(q)));
  grid.innerHTML = items.map(p=>`
    <div class="card">
      <img src="${p.img}" alt="${p.name}">
      <div class="body">
        <strong>${p.name}</strong>
        <div class="price">${fmt(p.price)}</div>
        <div class="actions">
          <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Cart actions
window.addToCart = function(id){
  const p = PRODUCTS.find(x=>x.id===id);
  const ex = cart.find(i=>i.id===id);
  if(ex) ex.qty++; else cart.push({ ...p, qty:1 });
  renderCart();
  cartPanel.classList.add('open');
}

function renderCart(){
  cartItemsEl.innerHTML = cart.length ? cart.map(i=>`
    <div class="item">
      <img src="${i.img}" alt="${i.name}">
      <div style="flex:1">
        <div>${i.name}</div>
        <small>${fmt(i.price)} × ${i.qty}</small>
      </div>
      <strong>${fmt(i.price*i.qty)}</strong>
    </div>
  `).join('') : '<em>Your cart is empty.</em>';

  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  const shipping = subtotal>0 ? 3000 : 0;
  const tax = Math.round(subtotal * 0.05);
  const grand = subtotal + shipping + tax;
  subtotalEl.textContent = fmt(subtotal);
  shippingEl.textContent = fmt(shipping);
  taxEl.textContent = fmt(tax);
  grandEl.textContent = fmt(grand);
}

// UI events
searchEl.addEventListener('input', renderProducts);
catEl.addEventListener('change', renderProducts);
cartBtn.addEventListener('click', ()=> cartPanel.classList.add('open'));
closeCartBtn.addEventListener('click', ()=> cartPanel.classList.remove('open'));

document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  document.getElementById('checkoutModal').classList.add('open');
});

document.getElementById('closeCheckout').addEventListener('click', ()=>{
  document.getElementById('checkoutModal').classList.remove('open');
});

// Payment QR toggle
const paymentEl = document.getElementById('payment');
const qrBox = document.getElementById('qrBox');
const qrImg = document.getElementById('qrImg');

paymentEl.addEventListener('change', e=>{
  const v = e.target.value;
  if(v==='kpay'){
    qrBox.style.display='block';
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?data=KBZPayAccount123&size=200x200';
  }else if(v==='wave'){
    qrBox.style.display='block';
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?data=WavePayAccount456&size=200x200';
  }else{
    qrBox.style.display='none';
    qrImg.src = '';
  }
});

// Checkout submit → Google Apps Script
const checkoutForm = document.getElementById('checkoutForm');
checkoutForm.addEventListener('submit', async e => {
  e.preventDefault();
  if(!cart.length){
    alert('Your cart is empty.');
    return;
  }
  const order = {
    name: document.getElementById('customerName').value,
    phone: document.getElementById('customerPhone').value,
    address: document.getElementById('customerAddress').value,
    payment: paymentEl.value,
    items: cart.map(p => `${p.name} (${p.price} Ks) x ${p.qty}`),
    total: cart.reduce((s,i)=>s+i.price*i.qty,0)
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){ throw new Error(data.message || 'Request failed'); }
    alert('✅ Order placed successfully!');
    cart = []; renderCart();
    document.getElementById('checkoutModal').classList.remove('open');
  } catch(err){
    console.error(err);
    alert('❌ Could not place order. Please check your Apps Script URL / deployment.');
  }
});

// Init
renderProducts();
renderCart();
