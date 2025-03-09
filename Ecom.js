let cartCount = 0;
const cartItems = [];

function addToCart() {
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
    const product = event.target.closest('.product');
    const productName = product.querySelector('h2').innerText;
    const productPrice = product.querySelector('.price').innerText;
    const productImage = product.querySelector('img').src;

    const existingItem = cartItems.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
    }
    updateCart();
    showNotification(`${productName} added to cart`);
}

function updateCart() {
    const cartItemsList = document.getElementById('cart-items');
    cartItemsList.innerHTML = '';
    let totalAmount = 0;
    cartItems.forEach(item => {
        const price = parseFloat(item.price.split(' ')[1]);
        totalAmount += price * item.quantity;
        const li = document.createElement('li');
        li.classList.add('cart-item');
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price" data-usd="${price}">${item.price}</span>
            <div class="cart-item-quantity-controls">
                <button onclick="decreaseQuantity('${item.name}')">-</button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button onclick="increaseQuantity('${item.name}')">+</button>
            </div>
        `;
        cartItemsList.appendChild(li);
    });
    document.getElementById('total-amount').innerText = `Total Amount: USD ${totalAmount.toFixed(2)}`;
}

function increaseQuantity(productName) {
    const item = cartItems.find(item => item.name === productName);
    if (item) {
        item.quantity++;
        cartCount++;
        document.getElementById('cart-count').innerText = cartCount;
        updateCart();
    }
}

function decreaseQuantity(productName) {
    const item = cartItems.find(item => item.name === productName);
    if (item && item.quantity > 1) {
        item.quantity--;
        cartCount--;
        document.getElementById('cart-count').innerText = cartCount;
        updateCart();
    } else if (item && item.quantity === 1) {
        cartItems.splice(cartItems.indexOf(item), 1);
        cartCount--;
        document.getElementById('cart-count').innerText = cartCount;
        updateCart();
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

function showProductDetails(product) {
    const productName = product.querySelector('h2').innerText;
    const productPrice = product.querySelector('.price').innerText;
    const productImage = product.querySelector('img').src;

    const productDetailsContainer = document.getElementById('product-details-container');
    productDetailsContainer.innerHTML = `
        <img src="${productImage}" alt="${productName}">
        <h2>${productName}</h2>
        <p class="price">${productPrice}</p>
        <button onclick="addToCart()">Add to Cart</button>
    `;
    showSection('product-details');
}

async function updatePrices() {
    const currency = document.getElementById('currency-selector').value;
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const data = await response.json();
    const rate = data.rates[currency];
    const prices = document.querySelectorAll('.price, .cart-item-price');
    prices.forEach(price => {
        const usdValue = price.getAttribute('data-usd');
        const convertedValue = (usdValue * rate).toFixed(2);
        price.innerText = `${currency} ${convertedValue}`;
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.container, header').forEach(section => {
        section.classList.add('hidden');
    });
    if (sectionId === 'contact') {
        document.getElementById('contact-details').classList.remove('hidden');
        document.querySelector('footer').classList.remove('hidden');
    } else {
        document.getElementById(sectionId).classList.remove('hidden');
        document.getElementById('contact-details').classList.add('hidden');
        document.querySelector('footer').classList.add('hidden');
    }
}

function showAddProductForm() {
    document.getElementById('add-product-form').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'block';
}

function hideAddProductForm() {
    document.getElementById('add-product-form').classList.add('hidden');
    document.getElementById('overlay').style.display = 'none';
}

function addNewProduct() {
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const imageUrl = document.getElementById('product-image-url').value;
    const imageFile = document.getElementById('product-image-file').files[0];

    if (name && price && (imageUrl || imageFile)) {
        let imageSrc = imageUrl;
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageSrc = e.target.result;
                createProduct(name, price, imageSrc);
            };
            reader.readAsDataURL(imageFile);
        } else {
            createProduct(name, price, imageSrc);
        }

        // Clear the form
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-image-url').value = '';
        document.getElementById('product-image-file').value = '';

        // Hide the form
        hideAddProductForm();
    } else {
        alert('Please fill out all fields.');
    }
}

function createProduct(name, price, imageSrc) {
    const productContainer = document.createElement('div');
    productContainer.classList.add('product');
    productContainer.innerHTML = `
        <img src="${imageSrc}" alt="Product Image" onclick="showProductDetails(this.parentElement)">
        <h2>${name}</h2>
        <p class="price" data-usd="${price}">USD ${price}</p>
        <button onclick="addToCart()">Add to Cart</button>
    `;
    const productsContainer = document.getElementById('products');
    productsContainer.insertBefore(productContainer, productsContainer.lastElementChild);

    // Add blast animation
    createBlastAnimation(productContainer);
}

function createBlastAnimation(container) {
    for (let i = 0; i < 20; i++) {
        const piece = document.createElement('div');
        piece.classList.add('blast-piece');
        piece.style.setProperty('--x', `${Math.random() * 200 - 100}px`);
        piece.style.setProperty('--y', `${Math.random() * 200 - 100}px`);
        container.appendChild(piece);
        setTimeout(() => {
            container.removeChild(piece);
        }, 500);
    }
}

function showUserDetailsForm() {
    document.getElementById('user-details-form').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'block';
}

function hideUserDetailsForm() {
    document.getElementById('user-details-form').classList.add('hidden');
    document.getElementById('overlay').style.display = 'none';
}

function saveUserDetails() {
    const userName = document.getElementById('user-name').value;
    const userEmail = document.getElementById('user-email').value;
    const userPhone = document.getElementById('user-phone').value;

    if (userName && userEmail && userPhone) {
        const userDetails = { name: userName, email: userEmail, phone: userPhone };
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        hideUserDetailsForm();
        displayUserDetails();
    } else {
        alert('Please fill out all fields.');
    }
}

function displayUserDetails() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    if (userDetails) {
        document.getElementById('user-greeting').innerText = `Hello, ${userDetails.name}`;
        const userDetailsContainer = document.getElementById('user-details-container');
        userDetailsContainer.innerHTML = `
            <p>Name: ${userDetails.name}</p>
            <p>Email: ${userDetails.email}</p>
            <p>Phone: ${userDetails.phone}</p>
        `;
    }
}

document.getElementById('user-greeting-button').addEventListener('click', showUserDetailsForm);

// Call displayUserDetails on page load to show user details if already saved
document.addEventListener('DOMContentLoaded', displayUserDetails);
