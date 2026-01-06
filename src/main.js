import { db, auth } from "./db.js";
import { 
  collection, addDoc, getDocs, deleteDoc, doc, onSnapshot 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";

let cart = [];
let products = [];
let isAdmin = false;

onAuthStateChanged(auth, (user) => {
  const adminLink = document.getElementById("adminLink");
  const addBtnFloat = document.getElementById("addBtnFloat");

  if (user) {
    isAdmin = true;
    adminLink.innerText = "Logout";
    adminLink.onclick = handleLogout;
    addBtnFloat.style.display = "block"; // Munculkan tombol tambah
  } else {
    isAdmin = false;
    adminLink.innerText = "Login Admin";
    adminLink.onclick = () => toggleModal('loginModal');
    addBtnFloat.style.display = "none";
  }
  renderProducts();
});

window.handleLogin = async () => {
  const email = document.getElementById("emailInput").value;
  const pass = document.getElementById("passInput").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Login Berhasil!");
    toggleModal('loginModal');
  } catch (error) {
    alert("Gagal Login: " + error.message);
  }
};

window.handleLogout = async () => {
  if(confirm("Yakin mau logout?")) {
    await signOut(auth);
    alert("Sudah Logout");
  }
};

const productsCol = collection(db, "products");
onSnapshot(productsCol, (snapshot) => {
  products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProducts();
});

window.addProduct = async () => {
  const title = document.getElementById("newTitle").value;
  const price = Number(document.getElementById("newPrice").value);
  const img = document.getElementById("newImg").value || "https://placehold.co/150x150?text=No+Image"; 

  if (!title || !price) return alert("Isi nama dan harga!");

  try {
    await addDoc(productsCol, { title, price, img });
    alert("Menu berhasil ditambahkan!");
    toggleModal('addModal');
    // Reset form
    document.getElementById("newTitle").value = "";
    document.getElementById("newPrice").value = "";
    document.getElementById("newImg").value = "";
  } catch (e) {
    alert("Error: " + e.message);
  }
};

window.deleteProduct = async (id) => {
  if (confirm("Hapus menu ini?")) {
    await deleteDoc(doc(db, "products", id));
  }
};

function renderProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach(p => {
    const priceRp = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(p.price);
    
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="p-info">
        <h4>${p.title}</h4>
        <p style="color:#f57224; font-weight:bold;">${priceRp}</p>
        <button class="btn-add" onclick="addToCart('${p.id}')">
          <i class="fa fa-plus"></i> Tambah
        </button>
        ${isAdmin ? `<button class="btn-delete" onclick="deleteProduct('${p.id}')">Hapus</button>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

window.addToCart = (id) => {
  const item = products.find(p => p.id === id);
  const existingItem = cart.find(c => c.id === id);

  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCartUI();
};

function updateCartUI() {
  const countSpan = document.getElementById("cartCount");
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  countSpan.innerText = totalQty;
}

document.getElementById("cartBtn").onclick = () => {
  if (cart.length === 0) return alert("Keranjang masih kosong!");
  
  const summaryDiv = document.getElementById("cartSummary");
  const totalSpan = document.getElementById("grandTotal");
  let totalHarga = 0;
  
  let html = "<ul style='list-style:none; padding:0;'>";
  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    totalHarga += subtotal;
    html += `<li style="display:flex; justify-content:space-between; margin-bottom:5px;">
              <span>${item.qty}x ${item.title}</span>
              <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
             </li>`;
  });
  html += "</ul>";
  
  summaryDiv.innerHTML = html;
  totalSpan.innerText = totalHarga.toLocaleString('id-ID');
  toggleModal('checkoutModal');
};

window.sendToWhatsapp = () => {
  const name = document.getElementById("custName").value;
  const address = document.getElementById("custAddress").value;
  const time = document.getElementById("deliveryTime").value;

  if (!name || !address || !time) return alert("Mohon lengkapi data pengiriman!");

  const phoneNumber = "6289647226274"; 

  let message = `Halo Admin, saya mau pesan:%0A%0A`;
  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    message += `- ${item.qty}x ${item.title} (Rp ${subtotal.toLocaleString('id-ID')})%0A`;
  });

  message += `%0A*Total: Rp ${total.toLocaleString('id-ID')}*`;
  message += `%0A%0AData Pengiriman:%0A`;
  message += `Nama: ${name}%0A`;
  message += `Alamat: ${address}%0A`;
  message += `Waktu: ${time}`;

  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
};

window.toggleModal = (id) => {
  const modal = document.getElementById(id);
  modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

document.getElementById("burgerBtn").onclick = () => {
  document.getElementById("navLinks").classList.toggle("active");
};