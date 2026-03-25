// Email Service using EmailJS (Free tier available)
// You'll need to sign up at https://www.emailjs.com/ for this to work

// EmailJS Configuration (you'll get these from EmailJS dashboard)
const EMAILJS_CONFIG = {
    serviceID: 'your_service_id', // Replace with your EmailJS service ID
    templateID: 'your_template_id', // Replace with your EmailJS template ID
    userID: 'your_user_id' // Replace with your EmailJS user ID
};

// Email configuration
const EMAIL_CONFIG = {
    from_email: 'tanisathe1116@gmail.com', // Your business email (sender)
    from_name: 'Chic Boutique', // Your business name
    admin_email: 'tanisathe1116@gmail.com', // Admin email for notifications
    admin_name: 'Chic Boutique Admin'
};

// Initialize EmailJS
function initEmailJS() {
    // Load EmailJS SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = function() {
        emailjs.init(EMAILJS_CONFIG.userID);
        console.log('EmailJS initialized');
    };
    document.head.appendChild(script);
}

// Send order confirmation email
function sendOrderConfirmationEmail(orderData) {
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not loaded, falling back to mailto');
        sendOrderEmail(orderData);
        return;
    }

    const templateParams = {
        from_email: EMAIL_CONFIG.from_email,
        from_name: EMAIL_CONFIG.from_name,
        to_email: orderData.email,
        to_name: orderData.customerName,
        order_id: orderData.id,
        order_date: new Date(orderData.timestamp).toLocaleDateString('en-IN'),
        payment_method: orderData.paymentMethod,
        items: orderData.items.map(item => 
            `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('\n'),
        total_amount: orderData.total.toFixed(2),
        shipping_amount: orderData.shipping ? orderData.shipping.toFixed(2) : '0',
        billing_address: orderData.address,
        contact_email: EMAIL_CONFIG.from_email,
        contact_phone: '+91 98765 43210'
    };

    emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            showNotification('Order confirmation email sent successfully!');
        }, function(error) {
            console.log('Failed to send email:', error);
            showNotification('Email sending failed, please check your order details manually.');
            // Fallback to mailto
            sendOrderEmail(orderData);
        });
}

// Send admin notification email
function sendAdminNotificationEmail(orderData) {
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not loaded, falling back to mailto');
        sendAdminNotification(orderData);
        return;
    }

    const templateParams = {
        from_email: EMAIL_CONFIG.from_email,
        from_name: EMAIL_CONFIG.from_name,
        to_email: EMAIL_CONFIG.admin_email,
        to_name: EMAIL_CONFIG.admin_name,
        order_id: orderData.id,
        customer_name: orderData.customerName,
        customer_email: orderData.email,
        customer_phone: orderData.phone || 'Not provided',
        order_date: new Date(orderData.timestamp).toLocaleDateString('en-IN'),
        payment_method: orderData.paymentMethod,
        total_amount: orderData.total.toFixed(2),
        shipping_amount: orderData.shipping ? orderData.shipping.toFixed(2) : '0',
        billing_address: orderData.address,
        items: orderData.items.map(item => 
            `- ${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('\n'),
        payment_details: JSON.stringify(orderData.paymentDetails, null, 2)
    };

    emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, templateParams)
        .then(function(response) {
            console.log('Admin notification sent successfully!', response.status, response.text);
            showNotification('Admin notification sent successfully!');
        }, function(error) {
            console.log('Failed to send admin notification:', error);
            // Fallback to mailto
            sendAdminNotification(orderData);
        });
}

// Alternative: Use Formspree for form submissions
function setupFormspree() {
    // Create a form that submits to Formspree
    const form = document.createElement('form');
    form.action = 'https://formspree.io/f/your_form_id'; // Replace with your Formspree ID
    form.method = 'POST';
    form.style.display = 'none';
    
    document.body.appendChild(form);
    return form;
}

// Send email via Formspree
function sendViaFormspree(orderData) {
    const form = setupFormspree();
    
    // Add form fields
    form.innerHTML = `
        <input type="email" name="email" value="${orderData.email}">
        <input type="text" name="order_id" value="${orderData.id}">
        <input type="text" name="customer_name" value="${orderData.customerName}">
        <input type="text" name="total_amount" value="${orderData.total}">
        <textarea name="order_details">${JSON.stringify(orderData, null, 2)}</textarea>
    `;
    
    // Submit form
    form.submit();
}

// Initialize email service on page load
document.addEventListener('DOMContentLoaded', function() {
    // Try to initialize EmailJS
    initEmailJS();
});

// Export functions
window.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
window.sendAdminNotificationEmail = sendAdminNotificationEmail;
