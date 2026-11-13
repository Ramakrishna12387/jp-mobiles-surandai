const SHOP_WHATSAPP = "919876543210";
const ADMIN_USERNAME = "jpmobiles";
const ADMIN_PASSWORD = "jp123";

let isAdminLoggedIn = false;
let uploadedPhotoBase64 = "";

const defaultProducts = [
    {
        id: 1,
        name: "iPhone 15 (128GB - Blue)",
        category: "iPhones & Flagship",
        price: 64999,
        specs: "Dynamic Island • 48MP Main Cam • Bajaj EMI",
        badge: "JP Special",
        img: "images/iphone-15.jpg",
        fallback: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2,
        name: "Vivo V30 Pro 5G (8GB/256GB)",
        category: "5G Mobiles",
        price: 38999,
        specs: "ZEISS Portrait Camera • Free Smart Watch",
        badge: "5 Free Gifts",
        img: "images/vivo-v30pro.jpg",
        fallback: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3,
        name: "Oppo F25 Pro 5G (8GB/128GB)",
        category: "5G Mobiles",
        price: 22999,
        specs: "67W SuperVOOC • 4K Ultra Clear Video",
        badge: "0% Downpayment",
        img: "images/oppo-f25.jpg",
        fallback: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 4,
        name: "Redmi 13C 5G (4GB/128GB)",
        category: "5G Mobiles",
        price: 10999,
        specs: "50MP AI Cam • 90Hz Display • Free Neckband",
        badge: "Budget King",
        img: "images/redmi-13c.jpg",
        fallback: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 5,
        name: "iPhone 13 Pro (256GB) - Demo Condition",
        category: "Pre-Owned",
        price: 49500,
        specs: "90% Battery Health • Untouched Original • Bill & Box",
        badge: "Verified Used",
        img: "images/iphone-13pro.jpg",
        fallback: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 6,
        name: "Apple 20W Original USB-C Adapter",
        category: "Accessories",
        price: 1699,
        specs: "100% Original Apple India Warranty",
        badge: "Original",
        img: "images/apple-20w.jpg",
        fallback: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80"
    }
];

let products = JSON.parse(localStorage.getItem("jp_mobiles_surandai_stock")) || defaultProducts;

function saveProductsToStorage() {
    localStorage.setItem("jp_mobiles_surandai_stock", JSON.stringify(products));
}

const repairTickets = {
    "JP101": {
        customer: "Suresh Kumar (Surandai)",
        device: "iPhone 12 (128GB)",
        issue: "Original Battery Replacement (100% Health)",
        status: "Ready for Delivery ✅",
        bill: "₹2,900 (6 Months Warranty)"
    },
    "JP102": {
        customer: "Ramesh (Alangulam)",
        device: "Samsung Galaxy A54 5G",
        issue: "Original Super AMOLED Display Change",
        status: "Testing in Progress 🔧 (15 Mins)",
        bill: "₹4,200"
    }
};

let activeCategory = "all";

// 1. Page Navigation Router with History API (Fixes Back Button Exit Problem)
function navigateTo(pageId, pushToHistory = true) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active-nav", btn.getAttribute("data-page") === pageId);
    });

    document.querySelectorAll(".mob-nav-btn").forEach(btn => {
        btn.classList.toggle("active-mob-nav", btn.getAttribute("data-page") === pageId);
    });

    if (pageId === "admin") renderAdminView();

    if (pushToHistory) {
        window.history.pushState({ page: pageId }, "", `#${pageId}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Handle Phone Back Button & Browser Back Button
window.addEventListener("popstate", (event) => {
    if (event.state && event.state.page) {
        navigateTo(event.state.page, false);
    } else {
        const hashPage = window.location.hash.replace("#", "") || "home";
        navigateTo(hashPage, false);
    }
});

// Prevent Accidental Backspace Key Exit
window.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        const tag = event.target.tagName.toLowerCase();
        const isInput = tag === "input" || tag === "textarea" || event.target.isContentEditable;
        if (!isInput) {
            event.preventDefault();
        }
    }
});

function quickCategoryJump(cat) {
    navigateTo("catalog");
    filterProducts(cat);
}

// 2. Product Card Renderer
function createProductCard(item) {
    const emiPerMonth = Math.round(item.price / 8);
    const fallbackImg = item.fallback || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80";

    return `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md hover:border-sky-500/40 transition">
            <div>
                <div class="relative h-36 sm:h-52 bg-slate-950">
                    <img src="${item.img}" 
                         onerror="this.src='${fallbackImg}'" 
                         alt="${item.name}" 
                         class="w-full h-full object-cover">
                    <span class="absolute top-2 left-2 bg-sky-400 text-slate-950 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow">
                        ${item.badge}
                    </span>
                </div>
                <div class="p-3 sm:p-4">
                    <h4 class="text-sm sm:text-lg font-bold text-white leading-snug line-clamp-1">${item.name}</h4>
                    <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">${item.specs}</p>
                    <div class="mt-2 pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                        <span class="text-base sm:text-xl font-bold text-sky-400">₹${item.price.toLocaleString('en-IN')}</span>
                        <span class="text-[10px] sm:text-xs text-emerald-400 font-bold">EMI ₹${emiPerMonth}/m</span>
                    </div>
                </div>
            </div>
            <div class="px-3 pb-3 sm:px-4 sm:pb-4">
                <button onclick="openWhatsApp('Vanakkam JP Mobiles Surandai! Naan ${item.name} (₹${item.price}) vaanga virumbugiren.')" 
                    class="w-full py-2 sm:py-2.5 rounded-xl bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow">
                    <i class="fa-brands fa-whatsapp text-sm sm:text-base"></i> Buy / Enquire
                </button>
            </div>
        </div>
    `;
}

function renderGrids(searchQuery = "") {
    const homeGrid = document.getElementById("home-featured-grid");
    const catalogGrid = document.getElementById("catalog-grid");

    if (homeGrid) {
        homeGrid.innerHTML = products.slice(0, 4).map(createProductCard).join("");
    }

    if (catalogGrid) {
        const filtered = products.filter(p => {
            const matchesCat = activeCategory === "all" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  p.specs.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        catalogGrid.innerHTML = filtered.length
            ? filtered.map(createProductCard).join("")
            : `<p class="text-slate-400 col-span-full text-center py-6 text-sm">No mobile found. Tap WhatsApp to enquire directly!</p>`;
    }
}

function filterProducts(category) {
    activeCategory = category;
    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.classList.toggle("active-cat", btn.getAttribute("data-cat") === category);
    });
    renderGrids(document.getElementById("search-input")?.value || "");
}

function searchCatalog() {
    renderGrids(document.getElementById("search-input").value);
}

// 3. Admin Login & Camera Upload
function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();
    const err = document.getElementById("login-error");

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        err.classList.add("hidden");
        renderAdminView();
    } else {
        err.classList.remove("hidden");
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    renderAdminView();
}

function renderAdminView() {
    document.getElementById("admin-login-box").classList.toggle("hidden", isAdminLoggedIn);
    document.getElementById("admin-dashboard-box").classList.toggle("hidden", !isAdminLoggedIn);
    if (isAdminLoggedIn) renderAdminTable();
}

function previewSelectedPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const maxW = 600;
            const scale = maxW / img.width;
            canvas.width = maxW;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            uploadedPhotoBase64 = canvas.toDataURL("image/jpeg", 0.8);
            document.getElementById("photo-preview-img").src = uploadedPhotoBase64;
            document.getElementById("photo-preview-container").classList.remove("hidden");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function addNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById("adm-name").value;
    const category = document.getElementById("adm-cat").value;
    const price = Number(document.getElementById("adm-price").value);
    const specs = document.getElementById("adm-specs").value;
    const folderPath = document.getElementById("adm-img-path").value.trim();

    const finalImage = uploadedPhotoBase64 || folderPath || "images/default-phone.jpg";

    products.unshift({
        id: Date.now(),
        name,
        category,
        price,
        specs,
        badge: "New Arrival",
        img: finalImage,
        fallback: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80"
    });

    saveProductsToStorage();
    renderGrids();
    renderAdminTable();

    e.target.reset();
    uploadedPhotoBase64 = "";
    document.getElementById("photo-preview-container").classList.add("hidden");
    alert(`"${name}" Added to Catalog!`);
    navigateTo("catalog");
}

function deleteProduct(id) {
    if (!confirm("Remove this mobile from stock?")) return;
    products = products.filter(p => p.id !== id);
    saveProductsToStorage();
    renderGrids();
    renderAdminTable();
}

function renderAdminTable() {
    const container = document.getElementById("admin-inventory-table");
    if (!container) return;

    container.innerHTML = products.map(item => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div class="flex items-center gap-3">
                <img src="${item.img}" onerror="this.src='${item.fallback}'" class="w-12 h-12 object-cover rounded-lg border border-slate-700">
                <div>
                    <h4 class="text-sm font-bold text-white">${item.name}</h4>
                    <p class="text-xs text-sky-400 font-bold">₹${item.price.toLocaleString('en-IN')} • ${item.category}</p>
                </div>
            </div>
            <button onclick="deleteProduct(${item.id})" class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join("");
}

function checkRepairStatus() {
    const code = document.getElementById("repair-ticket-input").value.trim().toUpperCase();
    const box = document.getElementById("repair-status-output");
    box.classList.remove("hidden");

    if (repairTickets[code]) {
        const t = repairTickets[code];
        box.innerHTML = `
            <p class="text-sky-400 font-bold">#${code} - ${t.customer}</p>
            <p class="text-slate-300 text-xs mt-0.5">${t.device} (${t.issue})</p>
            <p class="text-emerald-400 font-bold mt-1">${t.status} • Bill: ${t.bill}</p>
        `;
    } else {
        box.innerHTML = `<p class="text-red-400 text-xs">Ticket not found! Try <strong>JP101</strong> or <strong>JP102</strong>.</p>`;
    }
}

function submitServiceBooking(e) {
    e.preventDefault();
    const name = document.getElementById("srv-name").value;
    const phone = document.getElementById("srv-phone").value;
    const model = document.getElementById("srv-model").value;
    const issue = document.getElementById("srv-issue").value;

    const msg = `Vanakkam JP Mobiles Surandai!%0A*Repair Booking*%0AName: ${name}%0APhone: ${phone}%0AModel: ${model}%0AIssue: ${issue}`;
    window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${msg}`, "_blank");
}

function calculateExchange() {
    const base = Number(document.getElementById("ex-base").value);
    const cond = Number(document.getElementById("ex-cond").value);
    const box = Number(document.getElementById("ex-box").value);
    const total = Math.round(base * cond + box + 1000);
    document.getElementById("ex-result").innerText = `₹${total.toLocaleString('en-IN')}`;
}

function calculateEMI() {
    const price = Number(document.getElementById("emi-price").value) || 0;
    const down = Number(document.getElementById("emi-down").value) || 0;
    const months = Number(document.getElementById("emi-months").value) || 8;
    const monthly = Math.round(Math.max(0, price - down) / months);
    document.getElementById("emi-result").innerText = `₹${monthly.toLocaleString('en-IN')} / month`;
}

function openWhatsApp(message) {
    window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank");
}

// Initialize App & History State on Load
document.addEventListener("DOMContentLoaded", () => {
    renderGrids();
    calculateExchange();
    calculateEMI();

    // Set initial history state so pressing Back returns to Home instead of exiting browser
    const startPage = window.location.hash.replace("#", "") || "home";
    window.history.replaceState({ page: startPage }, "", `#${startPage}`);
    if (startPage !== "home") {
        navigateTo(startPage, false);
    }
});