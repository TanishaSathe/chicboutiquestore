# Email Setup Guide - Chic Boutique

## 📧 How Email Sending Works

### Current Setup:
- **Sender Email**: `tanisathe1116@gmail.com` (Your business email)
- **Recipient**: Customer's email address
- **Admin Notifications**: Also sent to `tanisathe1116@gmail.com`

## 🔧 Email Configuration Options

### Option 1: EmailJS (Recommended - Professional)
**How it works:**
- Emails sent FROM your business email
- Professional email templates
- Automatic sending
- No email client required

**Setup Steps:**
1. Sign up at https://www.emailjs.com/
2. Add your email service (Gmail)
3. Create email templates
4. Update `email-service.js` with your credentials

**Email Flow:**
```
Noire Fashion (tanisathe1116@gmail.com) → Customer Email
```

### Option 2: Mailto (Current - Manual)
**How it works:**
- Opens customer's email client
- From field shows customer's email
- Manual sending required

**Email Flow:**
```
Customer's Email → Customer's Email (Manual Send)
```

## 🎯 Recommended: EmailJS Setup

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up with Google (use tanisathe1116@gmail.com)

### Step 2: Add Email Service
1. Dashboard → Email Services → Add New Service
2. Select "Gmail"
3. Connect your tanisathe1116@gmail.com account
4. Authorize EmailJS to send emails

### Step 3: Create Templates

#### Customer Email Template:
```
Template Name: Order Confirmation
Subject: Order Confirmation - Noire Fashion - Order {{order_id}}

Content:
Dear {{to_name}},

Thank you for your order from Noire Fashion!

ORDER DETAILS:
Order ID: {{order_id}}
Date: {{order_date}}
Payment Method: {{payment_method}}

ITEMS PURCHASED:
{{items}}

ORDER TOTAL: ₹{{total_amount}}
{{#shipping_amount}}Shipping: ₹{{shipping_amount}}{{/shipping_amount}}

BILLING ADDRESS:
{{billing_address}}

DELIVERY INFORMATION:
• Standard delivery: 5-7 business days
• Express delivery: 2-3 business days
• You will receive tracking details once your order ships

CONTACT US:
• Email: {{contact_email}}
• Phone: {{contact_phone}}

This email was sent from Chic Boutique (tanisathe1116@gmail.com)

Thank you for choosing Chic Boutique!

Best regards,
The Chic Boutique Team
```

#### Admin Notification Template:
```
Template Name: Admin Order Notification
Subject: New Order Received - Chic Boutique - Order {{order_id}}

Content:
NEW ORDER ALERT!

Order ID: {{order_id}}
Customer: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}
Date: {{order_date}}
Payment Method: {{payment_method}}
Total: ₹{{total_amount}}
{{#shipping_amount}}Shipping: ₹{{shipping_amount}}{{/shipping_amount}}

Items:
{{items}}

Billing Address:
{{billing_address}}

Payment Details:
{{payment_details}}

Please process this order promptly.

---
Order received via Noire Fashion Website
```

### Step 4: Update Configuration
Update `email-service.js`:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'your_service_id',        // From EmailJS dashboard
    templateID: 'your_template_id',      // From EmailJS dashboard
    userID: 'your_user_id'               // From EmailJS dashboard
};
```

### Step 5: Test
1. Place a test order
2. Check if customer receives email
3. Check if you receive admin notification

## 📋 Email Templates for Different Services

### Gmail Configuration:
- **Service**: Gmail
- **From**: tanisathe1116@gmail.com
- **Reply-to**: tanisathe1116@gmail.com

### Other Email Services:
- **Outlook**: Works similarly
- **Custom Domain**: Use your business domain email

## 🔍 Troubleshooting

### Emails Not Sending:
1. Check EmailJS API keys
2. Verify email service connection
3. Check template variables
4. Look at browser console for errors

### Emails Going to Spam:
1. Check email content
2. Avoid spam trigger words
3. Verify sender reputation
4. Add recipient to contacts

### Admin Notifications Not Working:
1. Check admin email address
2. Verify template variables
3. Test with different email addresses

## 📱 Mobile Email Clients

EmailJS works with:
- Gmail mobile app
- Outlook mobile app
- Apple Mail
- All major email clients

## 🎉 Benefits of EmailJS

✅ **Professional Appearance**
- Emails sent from your business address
- Custom email templates
- Consistent branding

✅ **Automatic Sending**
- No manual intervention
- Instant delivery
- Reliable service

✅ **Customer Trust**
- Professional communication
- Order confirmations
- Brand consistency

✅ **Admin Efficiency**
- Instant notifications
- Complete order details
- Easy processing

## 🚀 Next Steps

1. **Setup EmailJS** (5 minutes)
2. **Test with sample order**
3. **Monitor email delivery**
4. **Adjust templates as needed**

Your Chic Boutique website will then send professional emails from your business address! 🎉
