// Admin Dashboard JavaScript
let adminProducts = [];

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadAdminData();
    initializeAdminEventListeners();
});

// Check if user is admin
function checkAdminAccess() {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('adminUser').textContent = user.name;
}

// Load admin data
function loadAdminData() {
    loadOrders();
    loadProducts();
    loadCustomers();
    updateStats();
}

// Load orders
function loadOrders() {
    const orders = getAllOrders();
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.email}</td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${new Date(order.timestamp).toLocaleDateString('en-IN')}</td>
            <td>
                <button onclick="viewOrderDetails('${order.id}')" class="action-btn">View</button>
                <button onclick="deleteOrder('${order.id}')" class="action-btn delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load products
function loadProducts() {
    // Load from main products array
    adminProducts = [...products];
    const grid = document.getElementById('adminProductsGrid');
    grid.innerHTML = '';
    
    adminProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'admin-product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>₹${product.price.toFixed(2)}</p>
                <p>${product.category}</p>
                <div class="product-actions">
                    <button onclick="editProduct(${product.id})" class="action-btn">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="action-btn delete">Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load customers
function loadCustomers() {
    const customers = window.customers || [];
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const customerOrders = getOrdersByEmail(customer.email);
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>${customerOrders.length}</td>
            <td>₹${totalSpent.toFixed(2)}</td>
            <td>${new Date(customer.firstOrder || customer.createdAt).toLocaleDateString('en-IN')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStats() {
    const orders = getAllOrders();
    const customers = window.customers || [];
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('totalProducts').textContent = adminProducts.length;
}

// Switch admin tabs
function switchAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').style.display = 'block';
    
    if (tab === 'analytics') {
        updateAnalytics();
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orders = getAllOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        showNotification(`Order ${orderId} status updated to ${newStatus}`);
    }
}

// View order details
function viewOrderDetails(orderId) {
    const orders = getAllOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const itemsList = order.items.map(item => 
            `${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        showNotification(`Order ${orderId}:\n${itemsList}\n\nTotal: ₹${order.total.toFixed(2)}`);
    }
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        const orders = getAllOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders.splice(index, 1);
            loadOrders();
            updateStats();
            showNotification('Order deleted successfully');
        }
    }
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

// Add new product
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || `https://picsum.photos/seed/${Date.now()}/400/400.jpg`
    };
    
    adminProducts.push(newProduct);
    products.push(newProduct); // Add to main products array
    
    loadProducts();
    updateStats();
    
    document.getElementById('addProductModal').style.display = 'none';
    document.getElementById('addProductForm').reset();
    
    showNotification('Product added successfully');
});

// Edit product
function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        
        showAddProductModal();
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const index = adminProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            adminProducts.splice(index, 1);
            products.splice(products.findIndex(p => p.id === productId), 1);
            loadProducts();
            updateStats();
            showNotification('Product deleted successfully');
        }
    }
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const orders = getAllOrders();
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.email.toLowerCase().includes(searchTerm)
    );
    
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.email}</td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>${order.status || 'pending'}</td>
            <td>${new Date(order.timestamp).toLocaleDateString('en-IN')}</td>
            <td>
                <button onclick="viewOrderDetails('${order.id}')" class="action-btn">View</button>
                <button onclick="deleteOrder('${order.id}')" class="action-btn delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search customers
function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const customers = window.customers || [];
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';
    
    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
    );
    
    filteredCustomers.forEach(customer => {
        const customerOrders = getOrdersByEmail(customer.email);
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>${customerOrders.length}</td>
            <td>₹${totalSpent.toFixed(2)}</td>
            <td>${new Date(customer.firstOrder || customer.createdAt).toLocaleDateString('en-IN')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update analytics
function updateAnalytics() {
    const period = document.getElementById('analyticsPeriod').value;
    const orders = getAllOrders();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    const recentOrders = orders.filter(order => new Date(order.timestamp) > cutoffDate);
    
    // Update top products
    const productSales = {};
    recentOrders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = 0;
            }
            productSales[item.name] += item.quantity;
        });
    });
    
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    topProductsList.innerHTML = '';
    
    topProducts.forEach(([productName, quantity], index) => {
        const item = document.createElement('div');
        item.className = 'top-product-item';
        item.innerHTML = `
            <span>${index + 1}. ${productName}</span>
            <span>${quantity} sold</span>
        `;
        topProductsList.appendChild(item);
    });
}

// Initialize admin event listeners
function initializeAdminEventListeners() {
    // Close add product modal
    const closeBtn = document.querySelector('.close-add-product');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('addProductModal').style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('addProductModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Logout admin
function logoutAdmin() {
    logoutUser();
    window.location.href = 'index.html';
}

// Export orders
function exportOrders() {
    const orders = getAllOrders();
    const dataStr = JSON.stringify(orders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `noire_orders_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Make functions globally available
window.switchAdminTab = switchAdminTab;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.deleteOrder = deleteOrder;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.searchOrders = searchOrders;
window.searchCustomers = searchCustomers;
window.updateAnalytics = updateAnalytics;
window.logoutAdmin = logoutAdmin;
window.exportOrders = exportOrders;
