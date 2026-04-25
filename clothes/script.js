// Add Cash on Delivery option
document.addEventListener('DOMContentLoaded', function() {
    // Add COD option to payment methods
    const paymentOptions = document.querySelector('.payment-options');
    if (paymentOptions) {
        const codOption = document.createElement('label');
        codOption.className = 'payment-option';
        codOption.innerHTML = `
            <input type="radio" name="paymentMethod" value="cod">
            <span class="payment-label">Cash on Delivery</span>
        `;
        paymentOptions.appendChild(codOption);
        
        // Add event listener for COD option
        codOption.querySelector('input').addEventListener('change', function() {
            const cardForm = document.getElementById('cardPaymentForm');
            const gpayForm = document.getElementById('gpayPaymentForm');
            
            if (this.value === 'cod') {
                cardForm.style.display = 'none';
                gpayForm.style.display = 'none';
                // Make all payment fields not required
                document.getElementById('cardName').required = false;
                document.getElementById('cardNumber').required = false;
                document.getElementById('expiry').required = false;
                document.getElementById('cvv').required = false;
                document.getElementById('gpayNumber').required = false;
                document.getElementById('gpayName').required = false;
            }
        });
    }
    
    // Add product search functionality
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-bar">
            <input type="text" id="productSearch" placeholder="Search products..." onkeyup="searchProducts()">
            <button onclick="searchProducts()"><i class="fas fa-search"></i></button>
        </div>
    `;
    
    // Insert search bar before products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.parentNode.insertBefore(searchContainer, productsSection);
    }
});

// Product search functionality
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Customer order history
function showCustomerOrderHistory() {
    const user = getCurrentUser();
    if (!user) return;
    
    const customerOrders = getOrdersByEmail(user.email);
    const historyModal = document.createElement('div');
    historyModal.className = 'modal';
    historyModal.innerHTML = `
        <div class="modal-content">
            <span class="close-history">&times;</span>
            <h2>Your Order History</h2>
            <div class="order-history">
                ${customerOrders.length === 0 ? 
                    '<p>You haven\'t placed any orders yet.</p>' :
                    customerOrders.map(order => `
                        <div class="order-history-item">
                            <div class="order-header">
                                <span class="order-id">${order.id}</span>
                                <span class="order-status">${order.status || 'pending'}</span>
                                <span class="order-date">${new Date(order.timestamp).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div class="order-items">
                                ${order.items.map(item => 
                                    `<div class="order-item">
                                        <span>${item.name} (x${item.quantity})</span>
                                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>`
                                ).join('')}
                            </div>
                            <div class="order-total">
                                <strong>Total: ₹${order.total.toFixed(2)}</strong>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(historyModal);
    historyModal.style.display = 'block';
    
    // Close modal
    historyModal.querySelector('.close-history').addEventListener('click', () => {
        historyModal.remove();
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.remove();
        }
    });
}

// Add order history link to user menu
document.addEventListener('DOMContentLoaded', function() {
    const userSection = document.querySelector('.user-section');
    if (userSection) {
        const orderHistoryLink = document.createElement('button');
        orderHistoryLink.className = 'order-history-btn';
        orderHistoryLink.textContent = 'Order History';
        orderHistoryLink.onclick = showCustomerOrderHistory;
        userSection.appendChild(orderHistoryLink);
    }
});

// Shipping cost calculation
function calculateShipping(address, total) {
    // Simple shipping logic based on total amount
    if (total >= 999) {
        return 0; // Free shipping for orders above ₹999
    }
    
    // Check if address contains major cities for reduced shipping
    const majorCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'];
    const addressLower = address.toLowerCase();
    
    if (majorCities.some(city => addressLower.includes(city))) {
        return 50; // ₹50 for major cities
    }
    
    return 100; // ₹100 for other locations
}

// Update payment form to handle COD and Razorpay
document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Calculate shipping
            const address = document.getElementById('address').value;
            const shippingCost = calculateShipping(address, total);
            const finalTotal = total + shippingCost;
            
            // Handle different payment methods
            if (paymentMethod === 'razorpay') {
                // Razorpay handles its own order saving
                handleRazorpayPayment();
                return; // Don't continue to save order here
            }
            
            // For COD, Card, and GPay - proceed with existing logic
            const orderData = {
                email: document.getElementById('email').value,
                address: address,
                total: finalTotal,
                subtotal: total,
                shipping: shippingCost,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                paymentMethod: paymentMethod,
                timestamp: new Date().toISOString()
            };
            
            // Add payment method specific data
            if (paymentMethod === 'card') {
                orderData.paymentDetails = {
                    cardName: document.getElementById('cardName').value,
                    cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, '').slice(-4),
                    expiry: document.getElementById('expiry').value
                };
                orderData.customerName = document.getElementById('cardName').value;
            } else if (paymentMethod === 'gpay') {
                orderData.paymentDetails = {
                    gpayNumber: document.getElementById('gpayNumber').value,
                    gpayName: document.getElementById('gpayName').value
                };
                orderData.customerName = document.getElementById('gpayName').value;
            } else if (paymentMethod === 'cod') {
                orderData.paymentDetails = {
                    method: 'Cash on Delivery',
                    instructions: 'Pay cash when order arrives'
                };
                orderData.customerName = document.getElementById('email').value.split('@')[0];
            }
            
            // Process order for non-Razorpay methods
            showNotification('Processing your order...');
            
            setTimeout(() => {
                const savedOrder = saveOrder(orderData);
                
                if (paymentMethod === 'cod') {
                    showNotification(`Order placed successfully! Total: ₹${finalTotal.toFixed(2)} (including ₹${shippingCost} shipping). Pay cash on delivery.`);
                } else {
                    showNotification(`Payment successful! Order total: ₹${finalTotal.toFixed(2)}`);
                }
                
                // Clear cart and close modal
                cart = [];
                updateCartUI();
                document.getElementById('paymentForm').reset();
                paymentModal.style.display = 'none';
                
                showOrderConfirmation(savedOrder.id);
                displayDatabaseStats();
                
                // Send emails only for non-COD orders
                if (paymentMethod !== 'cod') {
                    // Try to send real email first
                    if (typeof sendOrderConfirmationEmail === 'function') {
                        sendOrderConfirmationEmail(savedOrder);
                    } else {
                        // Fallback to mailto
                        sendOrderEmail(savedOrder);
                    }
                }
                
                // Always send admin notification
                sendAdminNotification(savedOrder);
            }, 2000);
        });
    }
});

// Go to admin dashboard
function goToAdmin() {
    const user = getCurrentUser();
    if (user && user.isAdmin) {
        window.location.href = 'admin.html';
    } else {
        showNotification('Admin access required');
        showAuthModal();
    }
}

// Authentication functions
function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = loginUser(email, password);
    
    if (result.success) {
        document.getElementById('authModal').style.display = 'none';
        updateUIForLoggedInUser();
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        showNotification(result.message || 'Login failed');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match');
        return;
    }
    
    const result = registerUser({ name, email, phone, password });
    
    if (result.success) {
        showNotification('Registration successful! Please login.');
        switchAuthTab('login');
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPhone').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        showNotification(result.message || 'Registration failed');
    }
}

// Proceed to payment with authentication check
function proceedToPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        showNotification('Please login to proceed with checkout');
        showAuthModal();
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    paymentTotal.textContent = total.toFixed(2);
    
    cartModal.style.display = 'none';
    paymentModal.style.display = 'block';
    
    // Reset payment method selection
    const firstPaymentOption = document.querySelector('input[name="paymentMethod"]');
    if (firstPaymentOption) {
        firstPaymentOption.checked = true;
        // Trigger change event to show correct form
        firstPaymentOption.dispatchEvent(new Event('change'));
    }
}

// Sample product data - Women's wear only (prices in INR)
const products = [
    {
        id: 1,
        name: "Wool Sweater",
        price: 3499,
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
        category: "women",
        description: "Warm wool sweater"
    },
    {
        id: 2,
        name: "Elegant Blouse",
        price: 2999,
        image: "https://images.pexels.com/photos/696981/pexels-photo-696981.jpeg?auto=compress&cs=tinysrgb&w=400",
        category: "women",
        description: "Stylish office blouse"
    },
    {
        id: 3,
        name: "Wool Sweater",
        price: 4999,
        image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400",
        category: "women",
        description: "Warm wool sweater"
    },
    
];

// Shopping cart
let cart = [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartModal = document.getElementById('cartModal');
const paymentModal = document.getElementById('paymentModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const paymentTotal = document.getElementById('paymentTotal');
const cartCount = document.querySelector('.cart-count');
const closeBtn = document.querySelector('.close');
const closePaymentBtn = document.querySelector('.close-payment');

// Auth modal close
document.addEventListener('DOMContentLoaded', function() {
    const closeAuthBtn = document.querySelector('.close-auth');
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'none';
        });
    }
    
    // Close auth modal when clicking outside
    window.addEventListener('click', (e) => {
        const authModal = document.getElementById('authModal');
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCartUI();
});

// Render products
function renderProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">₹${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification('Product added to cart!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart modal
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div>
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" style="margin-left: 10px; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1002;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Cart modal
document.querySelector('.cart-icon').addEventListener('click', () => {
    cartModal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

closePaymentBtn.addEventListener('click', () => {
    paymentModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (e.target === paymentModal) {
        paymentModal.style.display = 'none';
    }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Proceed to payment
function proceedToPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    paymentTotal.textContent = total.toFixed(2);
    
    cartModal.style.display = 'none';
    paymentModal.style.display = 'block';
}

// Back to cart
function backToCart() {
    paymentModal.style.display = 'none';
    cartModal.style.display = 'block';
}

// Payment method switching
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const cardForm = document.getElementById('cardPaymentForm');
        const gpayForm = document.getElementById('gpayPaymentForm');
        
        if (this.value === 'card') {
            cardForm.style.display = 'block';
            gpayForm.style.display = 'none';
            // Make card fields required
            document.getElementById('cardName').required = true;
            document.getElementById('cardNumber').required = true;
            document.getElementById('expiry').required = true;
            document.getElementById('cvv').required = true;
            // Make GPay fields not required
            document.getElementById('gpayNumber').required = false;
            document.getElementById('gpayName').required = false;
        } else {
            cardForm.style.display = 'none';
            gpayForm.style.display = 'block';
            // Make GPay fields required
            document.getElementById('gpayNumber').required = true;
            document.getElementById('gpayName').required = true;
            // Make card fields not required
            document.getElementById('cardName').required = false;
            document.getElementById('cardNumber').required = false;
            document.getElementById('expiry').required = false;
            document.getElementById('cvv').required = false;
        }
    });
});

// Only allow numbers for GPay number
document.getElementById('gpayNumber').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});
document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Format expiry date
document.getElementById('expiry').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Only allow numbers for CVV
document.getElementById('cvv').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Payment form submission
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Collect order data
    const orderData = {
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        total: total,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
    };
    
    // Add payment method specific data
    if (paymentMethod === 'card') {
        orderData.paymentDetails = {
            cardName: document.getElementById('cardName').value,
            cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, '').slice(-4), // Only store last 4 digits
            expiry: document.getElementById('expiry').value
        };
        orderData.customerName = document.getElementById('cardName').value;
    } else {
        orderData.paymentDetails = {
            gpayNumber: document.getElementById('gpayNumber').value,
            gpayName: document.getElementById('gpayName').value
        };
        orderData.customerName = document.getElementById('gpayName').value;
    }
    
    // Simulate payment processing
    showNotification('Processing payment...');
    
    setTimeout(() => {
        // Save order to database
        const savedOrder = saveOrder(orderData);
        
        showNotification(`Payment successful! Order total: ₹${total.toFixed(2)}`);
        
        // Reset cart and forms
        cart = [];
        updateCartUI();
        document.getElementById('paymentForm').reset();
        paymentModal.style.display = 'none';
        
        // Show order confirmation with order ID
        showOrderConfirmation(savedOrder.id);
        
        // Send order confirmation emails
        sendOrderEmail(savedOrder);
        
        // Display database stats in console
        displayDatabaseStats();
    }, 2000);
});

// Show order confirmation
function showOrderConfirmation(orderId) {
    const confirmation = document.createElement('div');
    confirmation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1003;
        text-align: center;
        max-width: 400px;
    `;
    confirmation.innerHTML = `
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h2 style="color: #333; margin-bottom: 1rem;">Order Confirmed!</h2>
        <p style="color: #666; margin-bottom: 1rem;">Order ID: <strong>${orderId}</strong></p>
        <p style="color: #666; margin-bottom: 1.5rem;">Thank you for shopping at Chic Boutique. Your order has been successfully processed.</p>
        <p style="color: #666; margin-bottom: 0.5rem;">A confirmation email has been sent to your registered email address.</p>
        <p style="color: #666; margin-bottom: 1.5rem; font-size: 0.9rem;">Please check your inbox (and spam folder) for order details.</p>
        <button onclick="this.parentElement.remove()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(confirmation);
}

// Send order confirmation email
function sendOrderEmail(orderData) {
    // Generate email content
    const emailSubject = `Order Confirmation - Chic Boutique - Order #${orderData.id}`;
    const emailContent = generateOrderEmailContent(orderData);
    
    // Create mailto link with FROM address (though mailto doesn't fully support from field)
    const mailtoLink = `mailto:${orderData.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailContent)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
    
    // Also send notification to admin
    setTimeout(() => {
        sendAdminNotification(orderData);
    }, 1000);
}

// Redirect to Google Pay
function redirectToGPay(orderData) {
    // Create UPI payment URL for Google Pay
    const upiId = 'tanisathe1116@okicici'; // You'll need to set up your UPI ID
    const amount = orderData.total.toFixed(2);
    const transactionNote = `Order ${orderData.id} - Chic Boutique`;
    
    // Create Google Pay deep link
    const gpayUrl = `upi://pay?pa=${upiId}&pn=Chic Boutique&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Try to open Google Pay app
    window.location.href = gpayUrl;
    
    // Fallback: show instructions if app doesn't open
    setTimeout(() => {
        showGPayInstructions(orderData);
    }, 3000);
}

// Show GPay instructions
function showGPayInstructions(orderData) {
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1004;
        text-align: center;
        max-width: 400px;
    `;
    instructions.innerHTML = `
        <div style="font-size: 3rem; color: #4285F4; margin-bottom: 1rem;">💰</div>
        <h2 style="color: #333; margin-bottom: 1rem;">Complete Payment with Google Pay</h2>
        <p style="color: #666; margin-bottom: 1rem;">Order ID: <strong>${orderData.id}</strong></p>
        <p style="color: #666; margin-bottom: 1.5rem;">Amount: <strong>₹${orderData.total.toFixed(2)}</strong></p>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
            <p style="margin: 0; font-weight: 600; color: #333;">Manual Payment Steps:</p>
            <ol style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">
                <li>Open Google Pay app</li>
                <li>Scan QR code or enter UPI ID: <strong>tanisathe1116@okicici</strong></li>
                <li>Enter amount: ₹${orderData.total.toFixed(2)}</li>
                <li>Add note: Order ${orderData.id}</li>
                <li>Complete payment</li>
            </ol>
        </div>
        <button onclick="this.parentElement.remove()" style="background: #4285F4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">I Understand</button>
    `;
    document.body.appendChild(instructions);
}

// Generate email content for customer
function generateOrderEmailContent(orderData) {
    const itemsList = orderData.items.map(item => 
        `• ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    return `
Dear ${orderData.customerName},

Thank you for your order from Chic Boutique!

ORDER DETAILS:
Order ID: ${orderData.id}
Date: ${new Date(orderData.timestamp).toLocaleDateString('en-IN')}
Payment Method: ${orderData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Google Pay'}

ITEMS PURCHASED:
${itemsList}

ORDER TOTAL: ₹${orderData.total.toFixed(2)}

BILLING ADDRESS:
${orderData.address}

DELIVERY INFORMATION:
• Standard delivery: 5-7 business days
• Express delivery: 2-3 business days
• You will receive tracking details once your order ships

CONTACT US:
• Email: tanisathe1116@gmail.com
• Phone: +91 98765 43210

This email was sent from Chic Boutique (tanisathe1116@gmail.com)

Thank you for choosing Chic Boutique!

Best regards,
The Chic Boutique Team
    `.trim();
}

// Send admin notification
function sendAdminNotification(orderData) {
    // Method 1: Try real email service
    if (typeof sendAdminNotificationEmail === 'function') {
        sendAdminNotificationEmail(orderData);
        return;
    }
    
    // Method 2: Fallback to mailto (opens email client)
    const adminSubject = `New Order Received - Chic Boutique - Order #${orderData.id}`;
    const adminContent = `
NEW ORDER ALERT!

Order ID: ${orderData.id}
Customer: ${orderData.customerName}
Email: ${orderData.email}
Phone: ${orderData.phone || 'Not provided'}
Date: ${new Date(orderData.timestamp).toLocaleDateString('en-IN')}
Payment Method: ${orderData.paymentMethod}
Total: ₹${orderData.total.toFixed(2)}
${orderData.shipping ? `Shipping: ₹${orderData.shipping.toFixed(2)}` : ''}

Items:
${orderData.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Billing Address:
${orderData.address}

Payment Details:
${JSON.stringify(orderData.paymentDetails, null, 2)}

Please process this order promptly.

---
Order received via Chic Boutique Website
    `.trim();
    
    const adminMailtoLink = `mailto:tanisathe1116@gmail.com?subject=${encodeURIComponent(adminSubject)}&body=${encodeURIComponent(adminContent)}`;
    window.open(adminMailtoLink, '_blank');
    
    // Method 3: Show immediate admin notification
    showAdminOrderAlert(orderData);
}

// Show immediate admin notification popup
function showAdminOrderAlert(orderData) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1005;
        max-width: 400px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.5s ease;
    `;
    
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 2rem; margin-right: 10px;">🔔</div>
            <div>
                <h3 style="margin: 0; font-size: 1.1rem;">NEW ORDER RECEIVED!</h3>
                <p style="margin: 5px 0; font-size: 0.9rem;">Order ID: ${orderData.id}</p>
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <p style="margin: 0; font-size: 0.9rem;"><strong>Customer:</strong> ${orderData.customerName}</p>
            <p style="margin: 0; font-size: 0.9rem;"><strong>Email:</strong> ${orderData.email}</p>
            <p style="margin: 0; font-size: 0.9rem;"><strong>Total:</strong> ₹${orderData.total.toFixed(2)}</p>
            <p style="margin: 0; font-size: 0.9rem;"><strong>Payment:</strong> ${orderData.paymentMethod}</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Dismiss</button>
            <button onclick="viewOrderDetails('${orderData.id}')" style="background: white; color: #ff6b6b; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">View Details</button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 10000);
    
    // Play notification sound (if supported)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(e => console.log('Audio notification not supported'));
    } catch (e) {
        console.log('Audio notification not available');
    }
}

// Checkout button (legacy - redirect to proceedToPayment)
document.querySelector('.checkout-btn').addEventListener('click', proceedToPayment);

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
