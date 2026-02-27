// Basic SPA routing + UI interactions + catalog logic + cart.
// No dependencies. Mobile-first. LocalStorage persistence.

(function(){
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // State
    const state = {
        route: "#/",
        search: "",
        filters: { brand: "", category: "", model: "", year: "", sort: "relevance" },
        page: 1,
        cart: loadCart(),
    };

    // Init
    document.addEventListener("DOMContentLoaded", () => {
        initHeader();
        initHome();
        initCatalog();
        initProduct();
        initCart();
        initCheckout();
        initForms();
        router();
        window.addEventListener("hashchange", router);
        updateCartCount();
        setYear();
    });

    // Header
    function initHeader(){
        const navToggle = $("#navToggle");
        const mobileNav = $("#mobileNav");
        if(navToggle){
            navToggle.addEventListener("click", () => {
                const expanded = navToggle.getAttribute("aria-expanded") === "true";
                navToggle.setAttribute("aria-expanded", String(!expanded));
                mobileNav.hidden = expanded;
            });
        }
        const searchBtn = $("#searchBtn");
        const searchInput = $("#searchInput");
        searchBtn.addEventListener("click", () => {
            state.search = searchInput.value.trim();
            location.hash = "#/catalog";
        });
        searchInput.addEventListener("keydown", (e) => {
            if(e.key === "Enter"){
                state.search = searchInput.value.trim();
                location.hash = "#/catalog";
            }
        });
    }

    // Home
    function initHome(){
        // Categories grid
        const grid = $("#categoryGrid");
        if(!grid) return;
        grid.innerHTML = CATEGORIES.map(c => `
      <a class="category-card" href="#/catalog?category=${encodeURIComponent(c.id)}">
        <img src="${c.image}" alt="${c.name}" loading="lazy"/>
        <div>
          <strong>${c.name}</strong>
          <p class="muted small">Browse ${c.name.toLowerCase()} parts</p>
        </div>
      </a>
    `).join("");
    }

    // Catalog
    function initCatalog(){
        // Populate filter options
        const brandSelect = $("#brandSelect");
        const categorySelect = $("#categorySelect");
        const yearSelect = $("#yearSelect");
        if(brandSelect){
            BRANDS.forEach(b => {
                const opt = document.createElement("option");
                opt.value = b; opt.textContent = b;
                brandSelect.appendChild(opt);
            });
        }
        if(categorySelect){
            CATEGORIES.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id; opt.textContent = c.name;
                categorySelect.appendChild(opt);
            });
        }
        if(yearSelect){
            YEARS.forEach(y => {
                const opt = document.createElement("option");
                opt.value = String(y); opt.textContent = String(y);
                yearSelect.appendChild(opt);
            });
        }

        // Filters panel toggler (mobile)
        const filtersToggle = $("#filtersToggle");
        const filtersPanel = $("#filtersPanel");
        if(filtersToggle){
            filtersToggle.addEventListener("click", () => {
                const expanded = filtersToggle.getAttribute("aria-expanded") === "true";
                filtersToggle.setAttribute("aria-expanded", String(!expanded));
                filtersPanel.classList.toggle("hidden", expanded);
            });
        }

        $("#applyFilters").addEventListener("click", () => {
            state.filters.brand = brandSelect.value;
            state.filters.category = categorySelect.value;
            state.filters.model = $("#modelInput").value.trim();
            state.filters.year = $("#yearSelect").value;
            state.filters.sort = $("#sortSelect").value;
            state.page = 1;
            renderCatalog();
        });

        $("#clearFilters").addEventListener("click", () => {
            brandSelect.value = "";
            categorySelect.value = "";
            $("#modelInput").value = "";
            yearSelect.value = "";
            $("#sortSelect").value = "relevance";
            state.filters = { brand: "", category: "", model: "", year: "", sort: "relevance" };
            state.search = "";
            state.page = 1;
            renderCatalog();
        });
    }

    // Product detail
    function initProduct(){}

    // Cart
    function initCart(){}

    // Checkout
    function initCheckout(){
        const form = $("#checkoutForm");
        if(!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const items = getCart();
            if(items.length === 0){
                alert("Your cart is empty.");
                return;
            }
            // Simple validation
            const required = ["fullName","phone","address","city"];
            for(const id of required){
                const el = document.getElementById(id);
                if(!el.value.trim()){
                    el.focus();
                    alert("Please complete all required fields.");
                    return;
                }
            }
            // Mock order placement
            alert("Order placed! We will contact you shortly to confirm delivery and payment.");
            saveCart([]); // clear
            updateCartCount();
            location.hash = "#/";
        });
    }

    // Contact/About forms
    function initForms(){
        const contactForm = $("#contactForm");
        if(contactForm){
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                alert("Thanks! We’ll reach out soon.");
                contactForm.reset();
            });
        }
    }

    // Router
    function router(){
        const hash = location.hash || "#/";
        state.route = hash;
        const views = $$(".view");
        views.forEach(v => v.hidden = true);

        const [_, routeRaw] = hash.split("#/");
        const route = routeRaw?.split("?")[0] || "";
        const query = new URLSearchParams(routeRaw?.split("?")[1]);

        switch(route){
            case "":
                $("#home").hidden = false;
                break;
            case "catalog":
                $("#catalog").hidden = false;
                state.filters.category = query.get("category") || state.filters.category;
                renderCatalog();
                break;
            case "product":
                $("#product").hidden = false;
                renderProduct(query.get("id"));
                break;
            case "cart":
                $("#cart").hidden = false;
                renderCart();
                break;
            case "checkout":
                $("#checkout").hidden = false;
                renderCheckout();
                break;
            case "about":
                $("#about").hidden = false;
                break;
            case "contact":
                $("#contact").hidden = false;
                break;
            default:
                location.hash = "#/";
        }
    }

    // Catalog rendering
    function renderCatalog(){
        const title = $("#catalogTitle");
        const grid = $("#productGrid");
        const countEl = $("#catalogCount");
        const pagination = $("#pagination");

        // Build filtered set
        let list = PRODUCTS.slice();

        // Text search
        const q = (state.search || "").toLowerCase();
        if(q){
            list = list.filter(p =>
                [p.name, p.brand, p.model, p.category, p.sku, p.fitment].join(" ").toLowerCase().includes(q)
            );
        }

        // Filters
        const { brand, category, model, year, sort } = state.filters;
        if(brand) list = list.filter(p => p.brand === brand);
        if(category) list = list.filter(p => p.category === category);
        if(model) list = list.filter(p => p.model.toLowerCase().includes(model.toLowerCase()));
        if(year) list = list.filter(p => String(p.year) === String(year));

        // Sort
        const sorters = {
            "relevance": () => 0,
            "price-asc": (a,b) => a.price - b.price,
            "price-desc": (a,b) => b.price - a.price,
            "name-asc": (a,b) => a.name.localeCompare(b.name),
        };
        list.sort(sorters[sort] || sorters["relevance"]);

        // Pagination
        const total = list.length;
        const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        state.page = Math.min(state.page, pages);
        const start = (state.page - 1) * PAGE_SIZE;
        const visible = list.slice(start, start + PAGE_SIZE);

        title.textContent = category ? `Category: ${getCategoryName(category)}` : "All parts";
        countEl.textContent = `${total} item${total !== 1 ? "s" : ""} found`;
        grid.innerHTML = visible.map(renderProductCard).join("");

        pagination.innerHTML = "";
        for(let i=1;i<=pages;i++){
            const btn = document.createElement("button");
            btn.className = "page-btn";
            btn.textContent = i;
            if(i === state.page){
                btn.disabled = true;
                btn.style.background = "var(--primary)";
                btn.style.borderColor = "transparent";
            }
            btn.addEventListener("click", () => {
                state.page = i;
                renderCatalog();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            pagination.appendChild(btn);
        }
    }

    function renderProductCard(p){
        const price = formatCurrency(p.price);
        return `
      <article class="product-card">
        <a class="product-card__media" href="#/product?id=${encodeURIComponent(p.id)}" aria-label="${p.name}">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy"/>
        </a>
        <div class="product-card__body">
          <div class="product-card__title">${p.name}</div>
          <div class="product-card__meta">
            <span class="muted small">${p.brand} • ${p.model} • ${p.year}</span>
            ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          </div>
          <div class="product-card__meta">
            <span class="price">${price}</span>
            <span class="muted small">SKU: ${p.sku}</span>
          </div>
          <div class="product-card__actions">
            <button class="btn btn--primary" onclick="addToCart('${p.id}')">Add to cart</button>
            <a class="btn btn--ghost" href="#/product?id=${encodeURIComponent(p.id)}">Details</a>
          </div>
        </div>
      </article>
    `;
    }

    // Product page
    function renderProduct(id){
        const container = $("#productContainer");
        const product = PRODUCTS.find(p => p.id === id);
        if(!product){
            container.innerHTML = `<p>Product not found.</p>`;
            return;
        }
        const price = formatCurrency(product.price);
        container.innerHTML = `
      <div class="product-photos">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy"/>
      </div>
      <div class="product-info">
        <h2>${product.name}</h2>
        <p class="muted">${product.brand} • ${product.model} • ${product.year}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
        <p><strong>Fitment:</strong> ${product.fitment}</p>
        <p class="muted">${product.description}</p>
        <div class="product-actions" style="margin-top:.75rem;display:flex;gap:.5rem">
          <button class="btn btn--primary" onclick="addToCart('${product.id}')">Add to cart</button>
          <a class="btn btn--ghost" href="#/catalog">Back to catalog</a>
        </div>
        <div class="specs">
          <h3>Specifications</h3>
          <dl>
            ${Object.entries(product.specs || {}).map(([k,v]) => `
              <dt>${k}</dt><dd>${v}</dd>
            `).join("")}
          </dl>
        </div>
      </div>
    `;
    }

    // Cart logic
    window.addToCart = function(id){
        const product = PRODUCTS.find(p => p.id === id);
        if(!product){ return; }
        const cart = getCart();
        const existing = cart.find(i => i.id === id);
        if(existing){ existing.qty += 1; }
        else { cart.push({ id, qty: 1 }); }
        saveCart(cart);
        updateCartCount();
        alert("Added to cart.");
    };

    function renderCart(){
        const container = $("#cartItems");
        const items = getCart();
        if(items.length === 0){
            container.innerHTML = `<p>Your cart is empty.</p>`;
        }else{
            container.innerHTML = items.map(item => {
                const p = PRODUCTS.find(x => x.id === item.id);
                const price = p ? p.price * item.qty : 0;
                return `
          <div class="cart-item">
            <img src="${p.images[0]}" alt="${p.name}" />
            <div>
              <div class="cart-item__title">${p.name}</div>
              <div class="muted small">${p.brand} • ${p.model} • ${p.year}</div>
              <div style="margin-top:.3rem;display:flex;gap:.5rem;align-items:center">
                <button class="icon-btn" onclick="decreaseQty('${p.id}')">−</button>
                <span>Qty: ${item.qty}</span>
                <button class="icon-btn" onclick="increaseQty('${p.id}')">+</button>
                <button class="btn btn--ghost" onclick="removeFromCart('${p.id}')">Remove</button>
              </div>
            </div>
            <div><strong>${formatCurrency(price)}</strong></div>
          </div>
        `;
            }).join("");
        }
        const subtotal = items.reduce((sum, item) => {
            const p = PRODUCTS.find(x => x.id === item.id);
            return sum + (p ? p.price * item.qty : 0);
        }, 0);
        $("#cartSubtotal").textContent = formatCurrency(subtotal);
        const delivery = 20;
        $("#cartTotal").textContent = formatCurrency(subtotal + delivery);
    }

    window.increaseQty = function(id){
        const cart = getCart();
        const item = cart.find(i => i.id === id);
        if(item){ item.qty += 1; saveCart(cart); renderCart(); updateCartCount(); }
    };
    window.decreaseQty = function(id){
        const cart = getCart();
        const item = cart.find(i => i.id === id);
        if(item){
            item.qty = Math.max(1, item.qty - 1);
            saveCart(cart); renderCart(); updateCartCount();
        }
    };
    window.removeFromCart = function(id){
        const cart = getCart().filter(i => i.id !== id);
        saveCart(cart); renderCart(); updateCartCount();
    };

    function renderCheckout(){
        const items = getCart();
        const container = $("#checkoutItems");
        if(items.length === 0){
            container.innerHTML = `<p class="muted">No items in cart.</p>`;
        }else{
            container.innerHTML = items.map(item => {
                const p = PRODUCTS.find(x => x.id === item.id);
                return `<div class="cart-item" style="grid-template-columns:48px 1fr auto">
          <img src="${p.images[0]}" alt="${p.name}" />
          <div>
            <div class="small">${p.name}</div>
            <div class="muted small">Qty: ${item.qty}</div>
          </div>
          <div class="small"><strong>${formatCurrency(p.price * item.qty)}</strong></div>
        </div>`;
            }).join("");
        }
        const subtotal = items.reduce((sum, item) => {
            const p = PRODUCTS.find(x => x.id === item.id);
            return sum + (p ? p.price * item.qty : 0);
        }, 0);
        $("#checkoutSubtotal").textContent = formatCurrency(subtotal);
        const delivery = 20;
        $("#checkoutDelivery").textContent = formatCurrency(delivery);
        $("#checkoutTotal").textContent = formatCurrency(subtotal + delivery);
    }

    // Helpers: cart + currency
    function loadCart(){
        try{
            return JSON.parse(localStorage.getItem("vandrid_cart") || "[]");
        }catch{ return []; }
    }
    function getCart(){ return loadCart(); }
    function saveCart(items){
        localStorage.setItem("vandrid_cart", JSON.stringify(items));
    }
    function updateCartCount(){
        const count = getCart().reduce((sum,i)=>sum+i.qty,0);
        $("#cartCount").textContent = String(count);
    }
    function formatCurrency(n){
        return `GH₵${n.toFixed(2)}`;
    }
    function getCategoryName(id){
        return CATEGORIES.find(c => c.id === id)?.name || id;
    }
    function setYear(){
        const el = $("#year");
        if(el){ el.textContent = String(new Date().getFullYear()); }
    }
})();
