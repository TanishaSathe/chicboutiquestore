# Chic Boutique - Razorpay Integration Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com/
2. Click "Sign Up" → Create account
3. Verify email and phone number
4. Complete KYC (for live payments)

### Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Copy **Key ID** and **Key Secret**
4. You'll have both **Test** and **Live** keys

### Step 3: Update Configuration
Open `razorpay.js` and update:

```javascript
const RAZORPAY_CONFIG = {
    // Test Keys (for development)
    key_id: 'rzp_test_YourKeyIdHere',     // Replace with your test key
    key_secret: 'rzp_test_YourKeySecretHere', // Replace with your test secret
    
    // Production Keys (uncomment for live)
    // key_id: 'rzp_live_YourKeyIdHere',
    // key_secret: 'rzp_live_YourKeySecretHere',
    
    currency: 'INR',
    company_name: 'Noire Fashion',
    description: 'Premium Women\'s Clothing',
    logo: 'https://your-logo-url.com/logo.png', // Add your logo
    theme_color: '#e74c3c'
};
```

### Step 4: Test Integration
1. Start your website: `python3 -m http.server 8000`
2. Add products to cart
3. Proceed to checkout
4. Select "Razorpay" payment method
5. Use test card details:

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name
- Email: Your email

### Step 5: Go Live
1. Complete KYC verification
2. Switch to production keys
3. Uncomment production keys in `razorpay.js`
4. Your website is ready for real payments!

## 💳 Payment Methods Supported

Razorpay supports:
- Credit/Debit Cards
- Net Banking
- UPI (Google Pay, PhonePe, Paytm)
- Wallets (Paytm, Amazon Pay, etc.)
- EMI options
- Cardless EMI

## 🔧 Server Setup (Optional)

For production, you'll need a server to:
- Create Razorpay orders
- Verify payments
- Handle webhooks

### Example Server Endpoints:

```javascript
// Create Order Endpoint
app.post('/create-razorpay-order', async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;
    
    const order = await razorpay.orders.create({
        amount: amount,
        currency: currency,
        receipt: receipt,
        notes: notes
    });
    
    res.json(order);
});

// Verify Payment Endpoint
app.post('/verify-razorpay-payment', async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_CONFIG.key_secret)
        .update(body.toString())
        .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    res.json({ success: isAuthentic });
});
```

## 📱 Mobile App Integration

Razorpay also has mobile SDKs for:
- Android
- iOS
- React Native
- Flutter

## 🔒 Security Best Practices

1. **Never expose key_secret** in frontend code
2. **Always verify payments** on server
3. **Use HTTPS** for production
4. **Implement webhooks** for payment notifications
5. **Log all transactions** for audit

## 💰 Fees & Pricing

- **Setup**: Free
- **Transaction fees**: 2% + GST
- **International cards**: 3% + GST
- **No monthly fees**
- **No hidden charges**

## 🆘 Troubleshooting

### Common Issues:

**"Invalid Key ID"**
- Check if key is correct
- Ensure you're using test keys for testing

**"Payment Failed"**
- Check card details
- Ensure sufficient funds
- Verify internet connection

**"Order Not Found"**
- Check order creation
- Verify order ID format

**"Signature Mismatch"**
- Check verification logic
- Ensure correct key_secret

### Debug Mode:
Add this to `razorpay.js` for debugging:
```javascript
const options = {
    key: RAZORPAY_CONFIG.key_id,
    // ... other options
    modal: {
        ondismiss: function() {
            console.log('Payment dismissed');
        },
        escape: true,
        handleback: true,
        debug: true // Enable debug mode
    }
};
```

## 📞 Support

- **Email**: support@razorpay.com
- **Phone**: 022-6779-6777
- **Chat**: Available on website
- **Documentation**: https://razorpay.com/docs

## 🎯 Next Steps

1. ✅ Setup Razorpay account
2. ✅ Update API keys
3. ✅ Test with test cards
4. ✅ Complete KYC
5. ✅ Go live with production keys

Your Chic Boutique website is now ready to accept real payments! 🚀
