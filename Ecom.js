// ShopEase - Modular E-Commerce JS Skeleton

// --- State ---
let products = []; // {name, price, image, category, ...}
let cart = [];
let wishlist = [];
let orders = [];
let addresses = [];
let user = {};
let notifications = [];
let recentlyViewed = [];
let qaData = {};
let ratings = {};
let appliedCoupon = null;
let role = 'customer';
let currency = 'USD';
let rates = { USD: 1, EUR: 0.93, INR: 83, GBP: 0.79 };

// --- DOM Elements ---
const $ = id => document.getElementById(id);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load state from localStorage or API
    // products = fetchProductsFromAPI() or loadDemoProducts();
    // ...load cart, wishlist, orders, addresses, user, notifications, etc...

    // Navigation
    setupNavigation();

    // Product Listing
    renderProducts();
    setupProductControls();

    // Cart
    setupCart();

    // Wishlist
    setupWishlist();

    // Orders
    setupOrders();

    // Address Book
    setupAddressBook();

    // Coupons
    setupCoupons();

    // Product Q&A
    setupQA();

    // Account
    setupAccount();

    // Admin Dashboard
    setupAdmin();

    // Notifications
    setupNotifications();

    // Support
    setupSupport();

    // Recently Viewed
    renderRecentlyViewed();

    // Newsletter
    setupNewsletter();

    // Currency
    setupCurrency();

    // Show Home by default
    showSection('home-section');
});

// --- Navigation ---
function setupNavigation() {
    // ...add event listeners for nav links, show/hide sections...
    // Example:
    $('nav-home').onclick = () => showSection('home-section');
    $('nav-products').onclick = () => showSection('products-section');
    $('nav-categories').onclick = () => showSection('products-section');
    $('nav-orders').onclick = () => showModal('orders-modal');
    $('nav-cart').onclick = () => showModal('cart-modal');
    $('nav-wishlist').onclick = () => showModal('wishlist-modal');
    $('nav-account').onclick = () => showModal('account-modal');
    $('nav-admin').onclick = () => showModal('admin-modal');
    $('logout-btn').onclick = () => { /* ...logout logic... */ };
    $('shop-now-btn').onclick = () => showSection('products-section');
}

// --- Section/Modal Show/Hide ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    $(id).style.display = '';
    if (id === 'home-section') renderFeaturedProducts();
    if (id === 'products-section') renderProducts();
}
function showModal(id) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    $(id).classList.add('active');
    $('overlay').classList.add('active');
}
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-close') || e.target.id === 'overlay') {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        $('overlay').classList.remove('active');
    }
});

// --- Product Controls (search, sort, filter, add) ---
function setupProductControls() {
    // Populate categories in the select dropdown
    const catSelect = $('category-select');
    if (catSelect) {
        // Get unique categories from products
        const cats = Array.from(new Set(products.map(p => p.category))).sort();
        catSelect.innerHTML = `<option value="">All Categories</option>` +
            cats.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    // Search, sort, and filter event listeners
    $('search-input').oninput = renderProducts;
    $('sort-select').onchange = renderProducts;
    $('category-select').onchange = renderProducts;
    $('filter-btn').onclick = renderProducts;
}

// --- Product Listing ---
function renderProducts() {
    const grid = $('products-grid');
    if (!grid) return;
    let filtered = [...products];

    // Search filter
    const searchVal = ($('search-input')?.value || '').trim().toLowerCase();
    if (searchVal) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal));
    }

    // Category filter
    const catVal = $('category-select')?.value || '';
    if (catVal) {
        filtered = filtered.filter(p => p.category === catVal);
    }

    // Sorting
    const sortVal = $('sort-select')?.value || 'name';
    if (sortVal === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'price-low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }

    grid.innerHTML = '';
    if (!filtered.length) {
        grid.innerHTML = '<div style="color:#888;">No products found.</div>';
        return;
    }
    filtered.forEach((p, idx) => {
        // Always use the filtered index for event binding, but use the original index for data-idx
        const originalIdx = products.indexOf(p);
        const convertedPrice = (p.price * (rates[currency] || 1));
        let displayPrice = convertedPrice;
        // For INR, show as integer (no decimals)
        if (currency === 'INR') {
            displayPrice = Math.round(convertedPrice);
        } else {
            displayPrice = convertedPrice.toFixed(2);
        }
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h2>${p.name}</h2>
            <div class="price">${currency} ${displayPrice}</div>
            <div style="font-size:0.95em;color:#888;margin-bottom:0.5rem;">${p.category || ''}</div>
            <div class="product-actions">
                <button class="add-cart-btn" data-idx="${originalIdx}"><i class="fa fa-cart-plus"></i></button>
                <button class="wishlist-btn" data-idx="${originalIdx}"><i class="fa fa-heart"></i></button>
                <button class="details-btn" data-idx="${originalIdx}"><i class="fa fa-eye"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add event listeners for actions
    grid.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            addToCart(products[idx]);
        };
    });
    grid.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            wishlist.push(products[idx]);
            showNotification('Added to wishlist');
        };
    });
    grid.querySelectorAll('.details-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            showProductDetails(products[idx]);
        };
    });
    updateCartCount();
}

// --- Add to cart with quantity update ---
function addToCart(product) {
    const found = cart.find(item => item.name === product.name);
    if (found) {
        found.qty = (found.qty || 1) + 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    showNotification('Added to cart');
    updateCartCount();
}

// --- Update cart count in nav ---
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const cartCountElem = $('cart-count');
    if (cartCountElem) cartCountElem.textContent = count;
}

// --- Optionally, update cart count on page load ---
document.addEventListener('DOMContentLoaded', updateCartCount);

// Optionally, render featured products on home
function renderFeaturedProducts() {
    const grid = $('featured-products');
    if (!grid) return;
    grid.innerHTML = '';
    products.slice(0, 8).forEach((p, idx) => {
        const convertedPrice = (p.price * (rates[currency] || 1));
        let displayPrice = convertedPrice;
        if (currency === 'INR') {
            displayPrice = Math.round(convertedPrice);
        } else {
            displayPrice = convertedPrice.toFixed(2);
        }
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h2>${p.name}</h2>
            <div class="price">${currency} ${displayPrice}</div>
            <div style="font-size:0.95em;color:#888;margin-bottom:0.5rem;">${p.category || ''}</div>
            <div class="product-actions">
                <button class="add-cart-btn" data-idx="${idx}"><i class="fa fa-cart-plus"></i></button>
                <button class="wishlist-btn" data-idx="${idx}"><i class="fa fa-heart"></i></button>
                <button class="details-btn" data-idx="${idx}"><i class="fa fa-eye"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
    // Add event listeners for actions
    grid.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            cart.push(products[idx]);
            showNotification('Added to cart');
        };
    });
    grid.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            wishlist.push(products[idx]);
            showNotification('Added to wishlist');
        };
    });
    grid.querySelectorAll('.details-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            showProductDetails(products[idx]);
        };
    });
}

// --- Show product details modal ---
function showProductDetails(product) {
    const modal = $('product-details-modal');
    const content = $('product-details-content');
    if (!modal || !content) return;
    const convertedPrice = (product.price * (rates[currency] || 1));
    let displayPrice = convertedPrice;
    if (currency === 'INR') {
        displayPrice = Math.round(convertedPrice);
    } else {
        displayPrice = convertedPrice.toFixed(2);
    }
    content.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="width:120px;height:120px;object-fit:contain;margin-bottom:1rem;">
        <h2>${product.name}</h2>
        <div class="price">${currency} ${displayPrice}</div>
        <div style="font-size:0.95em;color:#888;margin-bottom:0.5rem;">${product.category || ''}</div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Product description here)</p>
    `;
    showModal('product-details-modal');
}

// --- Cart ---
function setupCart() {
    const cartModal = $('cart-modal');
    const cartList = $('cart-list');
    const cartSummary = $('cart-summary');
    const closeCartBtn = $('close-cart-btn');
    const checkoutBtn = $('checkout-btn');

    function renderCart() {
        cartList.innerHTML = '';
        if (!cart.length) {
            cartList.innerHTML = '<li style="color:#888;">Your cart is empty.</li>';
            cartSummary.textContent = '';
            return;
        }
        let total = 0;
        cart.forEach((item, idx) => {
            total += (item.price * (item.qty || 1));
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;border-radius:6px;">
                <span style="flex:1;">${item.name}</span>
                <span>Qty: <button class="cart-qty-minus" data-idx="${idx}">-</button> ${item.qty || 1} <button class="cart-qty-plus" data-idx="${idx}">+</button></span>
                <span>${currency} ${(item.price * (rates[currency] || 1) * (item.qty || 1)).toFixed(2)}</span>
                <button class="cart-remove-btn" data-idx="${idx}" style="background:#e53935;color:#fff;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;">&times;</button>
            `;
            cartList.appendChild(li);
        });
        cartSummary.textContent = `Total: ${currency} ${(total * (rates[currency] || 1)).toFixed(2)}`;

        // Quantity minus
        cartList.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (cart[idx].qty > 1) {
                    cart[idx].qty--;
                } else {
                    cart.splice(idx, 1);
                }
                renderCart();
                updateCartCount();
            };
        });
        // Quantity plus
        cartList.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                cart[idx].qty = (cart[idx].qty || 1) + 1;
                renderCart();
                updateCartCount();
            };
        });
        // Remove item
        cartList.querySelectorAll('.cart-remove-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                cart.splice(idx, 1);
                renderCart();
                updateCartCount();
            };
        });
    }

    // Show cart modal and render
    $('nav-cart').onclick = () => {
        showModal('cart-modal');
        renderCart();
    };
    if (closeCartBtn) closeCartBtn.onclick = () => {
        cartModal.classList.remove('active');
        $('overlay').classList.remove('active');
    };
    if (checkoutBtn) checkoutBtn.onclick = () => {
        if (!cart.length) {
            showNotification('Cart is empty');
            return;
        }
        // --- Place Order Implementation ---
        // Create order object
        const orderId = Date.now();
        const orderItems = cart.map(item => ({
            name: item.name,
            qty: item.qty || 1,
            price: item.price
        }));
        const orderTotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
        const order = {
            id: orderId,
            items: orderItems,
            total: orderTotal,
            status: "Placed",
            date: new Date().toLocaleDateString()
        };
        orders.unshift(order); // Add to beginning for latest first
        showNotification('Order placed successfully!');
        cart.length = 0;
        renderCart();
        updateCartCount();
        cartModal.classList.remove('active');
        $('overlay').classList.remove('active');
    };
}

// --- Wishlist ---
function setupWishlist() {
    const wishlistModal = $('wishlist-modal');
    const wishlistList = $('wishlist-list');
    const closeWishlistBtn = $('close-wishlist-btn');

    function renderWishlist() {
        wishlistList.innerHTML = '';
        if (!wishlist.length) {
            wishlistList.innerHTML = '<li style="color:#888;">Your wishlist is empty.</li>';
            return;
        }
        wishlist.forEach((item, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;border-radius:6px;">
                <span style="flex:1;">${item.name}</span>
                <span>${currency} ${(item.price * (rates[currency] || 1)).toFixed(2)}</span>
                <button class="wishlist-remove-btn" data-idx="${idx}" style="background:#e53935;color:#fff;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;">&times;</button>
            `;
            wishlistList.appendChild(li);
        });
        wishlistList.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                wishlist.splice(idx, 1);
                renderWishlist();
            };
        });
    }

    $('nav-wishlist').onclick = () => {
        showModal('wishlist-modal');
        renderWishlist();
    };
    if (closeWishlistBtn) closeWishlistBtn.onclick = () => {
        wishlistModal.classList.remove('active');
        $('overlay').classList.remove('active');
    };
}

// --- Orders ---
function setupOrders() {
    const ordersModal = $('orders-modal');
    const ordersList = $('orders-list');
    const closeOrdersBtn = $('close-orders-btn');

    function renderOrders() {
        ordersList.innerHTML = '';
        if (!orders.length) {
            ordersList.innerHTML = '<li style="color:#888;">No orders yet.</li>';
            return;
        }
        orders.forEach(order => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <b>Order #${order.id}</b> - <span style="color:${order.status === 'Placed' ? '#1a8917' : '#888'}">${order.status}</span> <br>
                    <small>${order.date}</small>
                </div>
                <div>
                    ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}
                </div>
                <div>
                    Total: ${currency} ${(order.total * (rates[currency] || 1)).toFixed(2)}
                </div>
            `;
            ordersList.appendChild(li);
        });
    }

    $('nav-orders').onclick = () => {
        showModal('orders-modal');
        renderOrders();
    };
    if (closeOrdersBtn) closeOrdersBtn.onclick = () => {
        ordersModal.classList.remove('active');
        $('overlay').classList.remove('active');
    };
}

// --- Address Book ---
function setupAddressBook() {
    // ...render addresses, handle add/remove...
}

// --- Coupons ---
function setupCoupons() {
    // ...handle coupon apply, discount calculation...
}

// --- Product Q&A ---
function setupQA() {
    // ...render Q&A, handle ask question...
}

// --- Account ---
function setupAccount() {
    const accountModal = $('account-modal');
    const userNameInput = $('user-name');
    const userEmailInput = $('user-email');
    const saveUserBtn = $('save-user-btn');
    const closeAccountBtn = $('close-account-btn');

    // Responsive: Show login if not logged in, else show account info
    function renderAccount() {
        if (!user || !user.name || !user.email) {
            accountModal.querySelector('h2').textContent = "Login to ShopEase";
            userNameInput.value = "";
            userEmailInput.value = "";
            saveUserBtn.textContent = "Login";
        } else {
            accountModal.querySelector('h2').textContent = "My Account";
            userNameInput.value = user.name;
            userEmailInput.value = user.email;
            saveUserBtn.textContent = "Save";
        }
    }

    // Show modal and render
    $('nav-account').onclick = () => {
        showModal('account-modal');
        renderAccount();
    };

    // Save/Login button
    saveUserBtn.onclick = () => {
        const name = userNameInput.value.trim();
        const email = userEmailInput.value.trim();
        if (!name || !email) {
            showNotification('Please enter your name and email.');
            userNameInput.classList.add('input-error');
            userEmailInput.classList.add('input-error');
            setTimeout(() => {
                userNameInput.classList.remove('input-error');
                userEmailInput.classList.remove('input-error');
            }, 1200);
            return;
        }
        user = { name, email };
        showNotification('Welcome, ' + name + '!');
        accountModal.classList.remove('active');
        $('overlay').classList.remove('active');
        // Optionally, show logout button
        $('logout-btn').style.display = '';
    };

    // Logout button
    $('logout-btn').onclick = () => {
        user = {};
        showNotification('Logged out!');
        $('logout-btn').style.display = 'none';
        // Optionally, show login modal again
        showModal('account-modal');
        renderAccount();
    };

    // Close modal
    if (closeAccountBtn) closeAccountBtn.onclick = () => {
        accountModal.classList.remove('active');
        $('overlay').classList.remove('active');
    };

    // Enter key submits login
    userNameInput.onkeydown = userEmailInput.onkeydown = function(e) {
        if (e.key === 'Enter') {
            saveUserBtn.click();
        }
    };
}

// --- Add input-error style for interactive feedback ---
const style = document.createElement('style');
style.innerHTML = `
.input-error {
    border: 2px solid var(--danger) !important;
    background: #ffeaea !important;
    transition: border 0.2s, background 0.2s;
}
`;
document.head.appendChild(style);

// --- Notifications ---
function setupNotifications() {
    // ...render notifications, show notification center...
}

// --- Support ---
function setupSupport() {
    // ...show support/help modal...
}

// --- Recently Viewed ---
function renderRecentlyViewed() {
    // ...render recently viewed products...
}

// --- Newsletter ---
function setupNewsletter() {
    // ...handle newsletter subscription...
}

// --- Currency ---
function setupCurrency() {
    const currencySelect = $('currency-select');
    if (currencySelect) {
        // Set initial value
        currencySelect.value = currency;
        // On change, update currency and re-render products, cart, wishlist, orders
        currencySelect.onchange = () => {
            currency = currencySelect.value;
            renderProducts();
            renderFeaturedProducts();
            // If cart modal is open, re-render cart
            if ($('cart-modal').classList.contains('active')) {
                // Only re-render cart, not re-setup
                const cartList = $('cart-list');
                const cartSummary = $('cart-summary');
                if (cartList && cartSummary) {
                    // Re-render cart items with new currency
                    let total = 0;
                    cartList.innerHTML = '';
                    if (!cart.length) {
                        cartList.innerHTML = '<li style="color:#888;">Your cart is empty.</li>';
                        cartSummary.textContent = '';
                    } else {
                        cart.forEach((item, idx) => {
                            total += (item.price * (item.qty || 1));
                            const li = document.createElement('li');
                            li.innerHTML = `
                                <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;border-radius:6px;">
                                <span style="flex:1;">${item.name}</span>
                                <span>Qty: <button class="cart-qty-minus" data-idx="${idx}">-</button> ${item.qty || 1} <button class="cart-qty-plus" data-idx="${idx}">+</button></span>
                                <span>${currency} ${(item.price * (rates[currency] || 1) * (item.qty || 1)).toFixed(2)}</span>
                                <button class="cart-remove-btn" data-idx="${idx}" style="background:#e53935;color:#fff;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;">&times;</button>
                            `;
                            cartList.appendChild(li);
                        });
                        cartSummary.textContent = `Total: ${currency} ${(total * (rates[currency] || 1)).toFixed(2)}`;
                    }
                }
            }
            // If wishlist modal is open, re-render wishlist
            if ($('wishlist-modal').classList.contains('active')) {
                const wishlistList = $('wishlist-list');
                if (wishlistList) {
                    wishlistList.innerHTML = '';
                    if (!wishlist.length) {
                        wishlistList.innerHTML = '<li style="color:#888;">Your wishlist is empty.</li>';
                    } else {
                        wishlist.forEach((item, idx) => {
                            const li = document.createElement('li');
                            li.innerHTML = `
                                <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;border-radius:6px;">
                                <span style="flex:1;">${item.name}</span>
                                <span>${currency} ${(item.price * (rates[currency] || 1)).toFixed(2)}</span>
                                <button class="wishlist-remove-btn" data-idx="${idx}" style="background:#e53935;color:#fff;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;">&times;</button>
                            `;
                            wishlistList.appendChild(li);
                        });
                    }
                }
            }
            // If orders modal is open, re-render orders
            if ($('orders-modal').classList.contains('active')) {
                const ordersList = $('orders-list');
                if (ordersList) {
                    ordersList.innerHTML = '';
                    if (!orders.length) {
                        ordersList.innerHTML = '<li style="color:#888;">No orders yet.</li>';
                    } else {
                        orders.forEach(order => {
                            const li = document.createElement('li');
                            li.innerHTML = `
                                <div>
                                    <b>Order #${order.id}</b> - <span style="color:${order.status === 'Placed' ? '#1a8917' : '#888'}">${order.status}</span> <br>
                                    <small>${order.date}</small>
                                </div>
                                <div>
                                    ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}
                                </div>
                                <div>
                                    Total: ${currency} ${(order.total * (rates[currency] || 1)).toFixed(2)}
                                </div>
                            `;
                            ordersList.appendChild(li);
                        });
                    }
                }
            }
        };
    }
}

// --- Utility: Show notification ---
function showNotification(msg) {
    const n = document.createElement('div');
    n.className = 'notification';
    n.innerHTML = `<i class="fa fa-check-circle"></i> <span>${msg}</span>`;
    document.getElementById('notification-container').appendChild(n);
    setTimeout(() => {
        n.style.transform = 'translateX(0)';
        n.style.opacity = '1';
    }, 10);
    setTimeout(() => {
        n.style.transform = 'translateX(100%)';
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 300);
    }, 2200);
}

// --- Demo Products: 100 products from different categories ---
products = [
    // Electronics
    { name: "Wireless Headphones", price: 59.99, image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Smart Watch", price: 99.99, image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Bluetooth Speaker", price: 39.99, image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Fitness Tracker", price: 29.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "4K Action Camera", price: 149.99, image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Noise Cancelling Earbuds", price: 79.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Portable Charger", price: 25.99, image: "https://images.unsplash.com/photo-1510557880182-3d4d3c1b9021?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Smartphone Gimbal", price: 89.99, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "VR Headset", price: 199.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    { name: "Wireless Mouse", price: 19.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80", category: "Electronics" },
    // Fashion
    { name: "Men's Denim Jacket", price: 49.99, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Women's Summer Dress", price: 39.99, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Classic Sneakers", price: 59.99, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Leather Handbag", price: 89.99, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Aviator Sunglasses", price: 29.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Wool Scarf", price: 19.99, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Sports Cap", price: 14.99, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Women's Blazer", price: 69.99, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Men's Chinos", price: 34.99, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    { name: "Leather Belt", price: 24.99, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", category: "Fashion" },
    // Home & Kitchen
    { name: "Ceramic Dinner Set", price: 59.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Non-stick Frying Pan", price: 24.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Electric Kettle", price: 29.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Memory Foam Pillow", price: 19.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Table Lamp", price: 34.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Wall Clock", price: 14.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Cotton Bedsheet", price: 39.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Stainless Steel Knife Set", price: 44.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Vacuum Cleaner", price: 99.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    { name: "Air Purifier", price: 129.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Home & Kitchen" },
    // Books
    { name: "The Great Gatsby", price: 9.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "Atomic Habits", price: 14.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "To Kill a Mockingbird", price: 12.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "1984 by George Orwell", price: 11.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "The Alchemist", price: 10.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "Sapiens", price: 16.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "Rich Dad Poor Dad", price: 13.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "The Power of Now", price: 15.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "The Subtle Art of Not Giving a F*ck", price: 14.49, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    { name: "Think and Grow Rich", price: 12.49, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", category: "Books" },
    // Beauty
    { name: "Vitamin C Serum", price: 19.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Moisturizing Cream", price: 24.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Sunscreen SPF 50", price: 15.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Lip Balm", price: 4.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Face Wash", price: 9.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Hair Oil", price: 11.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Shampoo", price: 8.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Conditioner", price: 8.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Face Mask", price: 6.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    { name: "Body Lotion", price: 13.99, image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", category: "Beauty" },
    // Sports & Outdoors
    { name: "Yoga Mat", price: 19.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Dumbbell Set", price: 49.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Tennis Racket", price: 59.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Football", price: 24.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Camping Tent", price: 89.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Hiking Backpack", price: 39.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Water Bottle", price: 9.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Cycling Helmet", price: 34.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Running Shoes", price: 69.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    { name: "Jump Rope", price: 7.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", category: "Sports & Outdoors" },
    // Toys & Games
    { name: "Building Blocks Set", price: 29.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Remote Control Car", price: 39.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Puzzle Game", price: 14.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Doll House", price: 49.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Board Game", price: 24.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Action Figure", price: 19.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Plush Toy", price: 12.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Toy Train Set", price: 34.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Rubik's Cube", price: 8.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    { name: "Kite", price: 6.99, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", category: "Toys & Games" },
    // Automotive
    { name: "Car Vacuum Cleaner", price: 29.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Car Phone Holder", price: 12.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Car Air Freshener", price: 5.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Car Cover", price: 39.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Tire Inflator", price: 24.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Car Cleaning Kit", price: 19.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Dash Cam", price: 59.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Car Jump Starter", price: 49.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Seat Organizer", price: 14.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    { name: "Steering Wheel Cover", price: 11.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Automotive" },
    // Grocery
    { name: "Organic Almonds 500g", price: 8.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Basmati Rice 5kg", price: 12.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Olive Oil 1L", price: 9.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Green Tea Bags", price: 4.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Honey 500g", price: 6.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Brown Bread", price: 2.49, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Peanut Butter", price: 3.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Corn Flakes", price: 2.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Instant Coffee", price: 5.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" },
    { name: "Tomato Ketchup", price: 1.99, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", category: "Grocery" }
];
