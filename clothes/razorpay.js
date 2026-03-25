// Razorpay Payment Integration
// You'll need to get your Razorpay keys from https://razorpay.com/

const RAZORPAY_CONFIG = {
    // Test Keys (for development)
    key_id: 'rzp_test_YourKeyIdHere', // Replace with your test key
    key_secret: 'rzp_test_YourKeySecretHere', // Replace with your test secret
    
    // Production Keys (uncomment for live)
    // key_id: 'rzp_live_YourKeyIdHere',
    // key_secret: 'rzp_live_YourKeySecretHere',
    
    currency: 'INR',
    company_name: 'Chic Boutique',
    description: 'Premium Women\'s Clothing',
    logo: 'https://your-logo-url.com/logo.png', // Add your logo URL
    theme_color: '#e74c3c'
};

// Initialize Razorpay
function initializeRazorpay() {
    // Load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
    
    script.onload = function() {
        console.log('Razorpay SDK loaded');
    };
}

// Create Razorpay order
async function createRazorpayOrder(amount, customerEmail, customerName) {
    try {
        // For production, you should create orders on your server
        // For now, we'll create a mock order
        const orderData = {
            amount: amount * 100, // Razorpay works with paise
            currency: RAZORPAY_CONFIG.currency,
            receipt: 'receipt_' + Date.now(),
            notes: {
                email: customerEmail,
                name: customerName
            }
        };
        
        // In production, make API call to your server:
        // const response = await fetch('/create-razorpay-order', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(orderData)
        // });
        // const order = await response.json();
        
        // For demo, return mock order
        return {
            id: 'order_' + Date.now(),
            amount: orderData.amount,
            currency: orderData.currency
        };
        
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        showNotification('Failed to create payment order');
        return null;
    }
}

// Open Razorpay checkout
async function openRazorpayCheckout(orderData, customerInfo) {
    try {
        const order = await createRazorpayOrder(orderData.total, customerInfo.email, customerInfo.name);
        
        if (!order) {
            return;
        }
        
        const options = {
            key: RAZORPAY_CONFIG.key_id,
            amount: order.amount,
            currency: order.currency,
            name: RAZORPAY_CONFIG.company_name,
            description: RAZORPAY_CONFIG.description,
            image: RAZORPAY_CONFIG.logo,
            order_id: order.id,
            handler: function(response) {
                // Payment successful
                handleRazorpaySuccess(response, orderData, customerInfo);
            },
            prefill: {
                name: customerInfo.name,
                email: customerInfo.email,
                contact: customerInfo.phone
            },
            notes: {
                address: customerInfo.address,
                order_id: orderData.id
            },
            theme: {
                color: RAZORPAY_CONFIG.theme_color
            },
            modal: {
                ondismiss: function() {
                    showNotification('Payment cancelled. Your order has not been placed.');
                    // Do NOT save order if payment is cancelled
                },
                escape: true,
                handleback: true,
                confirm_close: true,
                animation: 'fade'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
        
    } catch (error) {
        console.error('Error opening Razorpay checkout:', error);
        showNotification('Failed to open payment gateway');
    }
}

// Handle successful Razorpay payment
function handleRazorpaySuccess(response, orderData, customerInfo) {
    console.log('Payment successful:', response);
    
    showNotification('Verifying payment...');
    
    // Verify payment on server in production
    verifyRazorpayPayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature)
        .then(async (verificationResult) => {
            if (verificationResult.success) {
                // Payment verified, save order
                const finalOrderData = {
                    ...orderData,
                    paymentMethod: 'razorpay',
                    paymentDetails: {
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        signature: response.razorpay_signature,
                        method: 'Razorpay'
                    },
                    status: 'paid',
                    paymentStatus: 'completed'
                };
                
                const savedOrder = saveOrder(finalOrderData);
                
                // Clear cart only after successful payment
                cart = [];
                updateCartUI();
                document.getElementById('paymentForm').reset();
                paymentModal.style.display = 'none';
                
                showNotification('Payment successful! Order confirmed.');
                
                // Show order confirmation
                showOrderConfirmation(savedOrder.id);
                
                // Send confirmation email
                if (typeof sendOrderConfirmationEmail === 'function') {
                    sendOrderConfirmationEmail(savedOrder);
                }
                
                // Always send admin notification
                sendAdminNotification(savedOrder);
                
                // Display database stats
                displayDatabaseStats();
                
            } else {
                showNotification('Payment verification failed. Order not placed.');
            }
        })
        .catch(error => {
            console.error('Payment verification error:', error);
            showNotification('Payment verification failed. Please contact support.');
        });
}

// Verify Razorpay payment (server-side in production)
async function verifyRazorpayPayment(paymentId, orderId, signature) {
    try {
        // In production, send to your server for verification
        // const response = await fetch('/verify-razorpay-payment', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         razorpay_payment_id: paymentId,
        //         razorpay_order_id: orderId,
        //         razorpay_signature: signature
        //     })
        // });
        // return await response.json();
        
        // For demo, assume verification succeeds
        return { success: true };
        
    } catch (error) {
        console.error('Payment verification error:', error);
        return { success: false };
    }
}

// Add Razorpay option to payment methods
function addRazorpayOption() {
    const paymentOptions = document.querySelector('.payment-options');
    if (paymentOptions && !paymentOptions.querySelector('input[value="razorpay"]')) {
        const razorpayOption = document.createElement('label');
        razorpayOption.className = 'payment-option';
        razorpayOption.innerHTML = `
            <input type="radio" name="paymentMethod" value="razorpay">
            <span class="payment-label">
                <i class="fas fa-credit-card"></i> Razorpay
            </span>
        `;
        paymentOptions.appendChild(razorpayOption);
        
        // Add event listener
        razorpayOption.querySelector('input').addEventListener('change', function() {
            const cardForm = document.getElementById('cardPaymentForm');
            const gpayForm = document.getElementById('gpayPaymentForm');
            
            if (this.value === 'razorpay') {
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
}

// Update payment form to handle Razorpay
function updatePaymentFormForRazorpay() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm && !paymentForm.hasAttribute('data-razorpay-updated')) {
        paymentForm.setAttribute('data-razorpay-updated', 'true');
        
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            if (paymentMethod === 'razorpay') {
                handleRazorpayPayment();
            } else {
                // Handle other payment methods
                handleOtherPaymentMethods(paymentMethod);
            }
        });
    }
}

// Handle Razorpay payment
async function handleRazorpayPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please login to continue');
        showAuthModal();
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const address = document.getElementById('address').value;
    const shippingCost = calculateShipping(address, total);
    const finalTotal = total + shippingCost;
    
    const customerInfo = {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: address
    };
    
    const orderData = {
        id: generateOrderId(),
        email: user.email,
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
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    showNotification('Opening secure payment gateway...');
    
    try {
        await openRazorpayCheckout(orderData, customerInfo);
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment failed. Please try again.');
    }
}

// Handle other payment methods (existing logic)
function handleOtherPaymentMethods(paymentMethod) {
    // Existing payment logic here
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const address = document.getElementById('address').value;
    const shippingCost = calculateShipping(address, total);
    const finalTotal = total + shippingCost;
    
    // ... rest of existing payment logic
}

// Initialize Razorpay on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeRazorpay();
    setTimeout(() => {
        addRazorpayOption();
        updatePaymentFormForRazorpay();
    }, 1000);
});

// Export functions
window.openRazorpayCheckout = openRazorpayCheckout;
window.handleRazorpayPayment = handleRazorpayPayment;
