# Payment System Setup Guide

This guide will walk you through setting up the complete payment system for AssetLoop.

## 📋 Prerequisites Checklist

- [ ] Stripe account (free to create)
- [ ] MongoDB database running
- [ ] Backend server running
- [ ] Frontend application running
- [ ] Environment variables configured

---

## 🔧 Step-by-Step Setup

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete account verification (if required)

### 2. Get Your Stripe API Keys

#### For Development (Test Mode):
1. Log into Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Make sure you're in **Test mode** (toggle in top right)
4. Copy your **Publishable key** (starts with `pk_test_...`)
5. Copy your **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

#### For Production:
1. Switch to **Live mode** in Stripe Dashboard
2. Get your **Live keys** (starts with `pk_live_...` and `sk_live_...`)

### 3. Configure Backend Environment Variables

Create or update your `.env` file in the `backend` folder:

```env
# Existing variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:4200

# Add these Stripe variables
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: For production
NODE_ENV=development
```

**Important Notes:**
- Use test keys (`sk_test_...`) for development
- Use live keys (`sk_live_...`) for production
- Never commit `.env` file to git (add to `.gitignore`)

### 4. Set Up Stripe Webhook Endpoint

Webhooks are crucial for transaction processing. Stripe sends events to your backend when payments complete.

#### Option A: Local Development (Using Stripe CLI)

1. **Install Stripe CLI:**
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
   
   This will output a webhook signing secret like: `whsec_...`
   
4. **Copy the webhook secret** and add it to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
   ```

5. **Keep the CLI running** while testing payments

#### Option B: Production (Using Stripe Dashboard)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded` (optional)
   - `payment_intent.payment_failed` (optional)
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to your production `.env` file

### 5. Install Dependencies (if not already done)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../assetloop-frontend
npm install
```

### 6. Verify Backend Configuration

Check that your `backend/server.js` has:
- ✅ Webhook route configured BEFORE body parsers (line 57)
- ✅ Stripe webhook handler imported
- ✅ CORS configured for your frontend URL

### 7. Test the Payment Flow

#### Test Booking Payment:
1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend:
   ```bash
   cd assetloop-frontend
   ng serve
   ```

3. Start Stripe CLI (if testing locally):
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

4. Test payment flow:
   - Login as a renter
   - Create or select a booking
   - Go to Booking Payments
   - Click "Pay Now"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC
   - Complete the payment

5. Verify:
   - ✅ Transaction created in database
   - ✅ Booking `totalPaid` updated
   - ✅ Booking status changed to "confirmed"
   - ✅ Transaction appears in Transaction History

#### Test Wallet Top-up:
1. Go to Payments & Wallet → Overview
2. Click "Add Money"
3. Enter amount
4. Complete payment with test card
5. Verify wallet balance updated

### 8. Test Cards (Stripe Test Mode)

Use these test card numbers:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Success |
| `4000 0000 0000 0002` | Visa - Card declined |
| `4000 0000 0000 9995` | Visa - Insufficient funds |
| `5555 5555 5555 4444` | Mastercard - Success |

**For all test cards:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## 🔍 Troubleshooting

### Issue: "Missing STRIPE_SECRET_KEY in environment"
**Solution:** Add `STRIPE_SECRET_KEY` to your `.env` file

### Issue: Webhook signature verification failed
**Solution:** 
- Make sure `STRIPE_WEBHOOK_SECRET` is correct
- If using Stripe CLI, use the secret from `stripe listen` command
- Restart your backend server after updating `.env`

### Issue: Transactions not being created
**Solution:**
- Check webhook endpoint is accessible
- Verify webhook secret matches
- Check backend logs for errors
- Ensure Stripe CLI is running (for local dev)

### Issue: Payment succeeds but booking not updated
**Solution:**
- Check webhook handler is receiving events
- Verify database connection
- Check backend logs for transaction creation errors

### Issue: CORS errors
**Solution:**
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Format: `CORS_ORIGINS=http://localhost:4200,https://yourdomain.com`

---

## 📝 Environment Variables Summary

### Backend `.env` File:
```env
# Database
MONGO_URI=mongodb://localhost:27017/assetloop

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# CORS
CORS_ORIGINS=http://localhost:4200

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional
NODE_ENV=development
PORT=5000
```

### Frontend `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api', // Your backend URL
};
```

---

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Switch Stripe to **Live mode**
- [ ] Update `STRIPE_SECRET_KEY` to live key (`sk_live_...`)
- [ ] Set up production webhook endpoint in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
- [ ] Update `CORS_ORIGINS` with production frontend URL
- [ ] Update frontend `environment.production.ts` with production API URL
- [ ] Test payment flow in production mode
- [ ] Set up error monitoring/logging
- [ ] Configure SSL/HTTPS for webhook endpoint
- [ ] Test refund functionality (if needed)

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] Stripe keys are loaded (check logs)
- [ ] Webhook endpoint is accessible
- [ ] Test payment completes successfully
- [ ] Transaction is created in database
- [ ] Booking is updated correctly
- [ ] Transaction appears in Transaction History
- [ ] Wallet top-up works
- [ ] Payment methods can be added

---

## 🆘 Need Help?

If you encounter issues:
1. Check backend console logs
2. Check Stripe Dashboard → Events (to see webhook events)
3. Verify all environment variables are set
4. Ensure MongoDB is running and accessible
5. Check network connectivity between Stripe and your server

---

**Last Updated:** Based on current codebase implementation
**Status:** Ready for setup ✅

