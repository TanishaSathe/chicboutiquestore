// Simple in-memory database for storing order information
let orders = [];
let customers = [];

// Save order to database
function saveOrder(orderData) {
    const order = {
        id: generateOrderId(),
        timestamp: new Date().toISOString(),
        ...orderData
    };
    
    orders.push(order);
    
    // Also save customer information if new
    const existingCustomer = customers.find(c => c.email === orderData.email);
    if (!existingCustomer) {
        customers.push({
            email: orderData.email,
            name: orderData.customerName,
            address: orderData.address,
            phone: orderData.phone,
            firstOrder: order.timestamp
        });
    }
    
    console.log('Order saved:', order);
    console.log('All orders:', orders);
    console.log('All customers:', customers);
    
    return order;
}

// Generate unique order ID
function generateOrderId() {
    return 'NOIRE' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Get all orders
function getAllOrders() {
    return orders;
}

// Get orders by email
function getOrdersByEmail(email) {
    return orders.filter(order => order.email === email);
}

// Get customer information
function getCustomerByEmail(email) {
    return customers.find(customer => customer.email === email);
}

// Export data to JSON (for download/export functionality)
function exportOrders() {
    const dataStr = JSON.stringify({ orders, customers }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `noire_orders_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Display orders in console for development
function displayDatabaseStats() {
    console.log('=== NOIRE DATABASE STATS ===');
    console.log(`Total Orders: ${orders.length}`);
    console.log(`Total Customers: ${customers.length}`);
    console.log(`Total Revenue: ₹${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);
    console.log('=============================');
}

// Initialize database with sample data (optional)
function initializeSampleData() {
    if (orders.length === 0) {
        console.log('Database initialized. Ready to store orders.');
    }
}

// Auto-initialize
initializeSampleData();
