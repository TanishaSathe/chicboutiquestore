# Noire Fashion - Complete E-commerce Website

A fully functional women's clothing e-commerce website with admin dashboard, multiple payment options, and order management.

## 🚀 Features

### Customer Features
- **User Authentication**: Login/Register system
- **Product Catalog**: Browse women's clothing and accessories
- **Shopping Cart**: Add/remove items, quantity management
- **Multiple Payment Options**:
  - **Credit/Debit Card**: Direct card payments
  - **Google Pay**: UPI payments with QR code
  - **Cash on Delivery**: Pay on delivery
  - **Razorpay**: Professional payment gateway
    - Credit/Debit Cards
    - Net Banking
    - UPI (all apps)
    - Digital Wallets
    - EMI options
- **Order History**: View past orders and tracking
- **Product Search**: Real-time search functionality
- **Email Confirmations**: Automated order confirmations

### Admin Features
- **Admin Dashboard**: Complete order management
- **Product Management**: Add/edit/delete products
- **Order Tracking**: Update order status (Pending → Processing → Shipped → Delivered)
- **Customer Management**: View customer details and order history
- **Analytics**: Sales overview and top products
- **Export Orders**: Download order data as JSON

### Business Features
- **Shipping Calculation**: 
  - Free shipping above ₹999
  - City-based shipping rates
- **Payment Processing**: Secure payment handling
- **Order Management**: Complete order lifecycle
- **Customer Data Collection**: Email, phone, address storage

## 📁 File Structure

```
clothes/
├── index.html          # Main website
├── admin.html          # Admin dashboard
├── qr.html             # QR code generator
├── styles.css          # All styles
├── script.js           # Main functionality
├── admin.js            # Admin dashboard functionality
├── auth.js             # User authentication
├── database.js         # Order and customer data storage
├── email-service.js    # Email service (EmailJS integration)
├── razorpay.js         # Razorpay payment integration
├── README.md           # This file
└── RAZORPAY_SETUP.md   # Razorpay setup guide
```

## 🛠 Setup Instructions

### 1. Basic Setup (Works Immediately)
```bash
# Start local server
python3 -m http.server 8000
# Open http://localhost:8000
```

### 2. Razorpay Setup (Recommended for payments)
1. Sign up at https://razorpay.com/
2. Get API keys from dashboard
3. Update `razorpay.js` with your keys:
   ```javascript
   const RAZORPAY_CONFIG = {
       key_id: 'rzp_test_YourKeyIdHere',
       key_secret: 'rzp_test_YourKeySecretHere'
   };
   ```
4. Test with provided test cards
5. Complete KYC for live payments

### 3. Email Setup (Optional but Recommended)

#### Option A: EmailJS (Recommended)
1. Sign up at https://www.emailjs.com/
2. Create a new email service
3. Create an email template
4. Update `email-service.js` with your credentials:
   ```javascript
   const EMAILJS_CONFIG = {
       serviceID: 'your_service_id',
       templateID: 'your_template_id', 
       userID: 'your_user_id'
   };
   ```

#### Option B: Formspree (Alternative)
1. Sign up at https://formspree.io/
2. Create a new form
3. Update the form action in `email-service.js`

### 3. UPI Payment Setup
1. Update your UPI ID in `script.js`:
   ```javascript
   const upiId = 'tanisathe1116@okicici'; // Your actual UPI ID
   ```
2. Generate QR code using `qr.html`

## 🔑 Admin Access

**Default Admin Account:**
- Email: `admin@noire.com`
- Password: `admin123`

## 💳 Payment Options

### 1. Credit/Debit Card
- Form validation
- Secure data handling (only last 4 digits stored)

### 2. Google Pay
- Real QR code scanning
- UPI deep link integration
- Fallback instructions

### 3. Cash on Delivery
- No payment processing required
- Shipping cost calculation
- Order confirmation

## 📊 Data Storage

All data is stored in browser localStorage:
- Orders: Complete order history
- Customers: Customer information
- Products: Product catalog
- Users: Authentication data

**To export data:**
1. Open browser console (F12)
2. Run: `exportOrders()`
3. Orders download as JSON file

## 🎨 Customization

### Update Brand Information
- **Brand Name**: Update "Noire" in all files
- **Contact Email**: Currently `tanisathe1116@gmail.com`
- **Phone Number**: Currently `+91 98765 43210`
- **UPI ID**: Currently `tanisathe1116@okicici`

### Add Products
1. Login as admin
2. Go to Admin Dashboard
3. Click "Add New Product"
4. Fill product details

### Update Prices
- All prices are in INR (₹)
- Update product prices in `script.js`
- Shipping costs in `calculateShipping()` function

## 🚀 Deployment

### Static Hosting (Recommended)
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### Server Setup
- Upload all files to server
- Ensure HTTPS for secure payments
- Configure domain and SSL

## 📱 Mobile Responsive

The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Troubleshooting

### Email Not Working
- Check EmailJS configuration
- Verify template IDs
- Ensure API keys are correct

### QR Code Not Scanning
- Verify UPI ID format
- Check QR code generation
- Test with different payment apps

### Admin Access Issues
- Clear browser cache
- Check localStorage
- Use default admin credentials

## 📞 Support

For issues or questions:
- Email: tanisathe1116@gmail.com
- Phone: +91 98765 43210

## 📄 License

This project is for educational and commercial use. Feel free to modify and deploy for your business.

---

**Noire Fashion** - Premium Women's Clothing E-commerce Platform
