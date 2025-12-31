# 🚀 Production Deployment Checklist

This guide covers all the changes needed to deploy your AssetLoop application to production on Vercel.

---

## 📋 Pre-Deployment Checklist

### 1. **Backend Environment Variables (Vercel)**

Go to your Vercel project dashboard → Settings → Environment Variables and add/update:

#### Required Variables:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/assetloop?retryWrites=true&w=majority
# ⚠️ Use your production MongoDB Atlas connection string

# Authentication
JWT_SECRET=your_super_secret_production_jwt_key_here
# ⚠️ Use a strong, unique secret for production (different from development)

# Frontend URL
FRONTEND_URL=https://your-frontend-url.vercel.app
# ⚠️ Replace with your actual frontend Vercel URL

# Stripe (LIVE MODE - Switch from test to live!)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
# ⚠️ CRITICAL: Switch from sk_test_ to sk_live_ for production
# Get this from: Stripe Dashboard → Developers → API keys → Reveal live key

STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
# ⚠️ This will be set up in step 2 below

# Email Configuration (if using SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Optional
NODE_ENV=production
PORT=5000
```

#### ⚠️ **IMPORTANT**: 
- **Never use test keys in production**
- **Never commit `.env` files to Git**
- **Use different JWT_SECRET for production**

---

### 2. **Stripe Production Setup**

#### A. Switch to Live Mode:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from **Test mode** to **Live mode** (top right)
3. Copy your **Live Secret Key** (`sk_live_...`)
4. Add it to Vercel environment variables as `STRIPE_SECRET_KEY`

#### B. Set Up Production Webhook:
1. In Stripe Dashboard (Live mode) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production webhook URL:
   ```
   https://your-backend-url.vercel.app/api/payments/stripe/webhook
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed` (Required)
   - ✅ `payment_intent.succeeded` (Optional)
   - ✅ `payment_intent.payment_failed` (Optional)
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

#### C. Verify PKR Currency Support:
- Ensure your Stripe account supports PKR (Pakistani Rupee)
- Check: Stripe Dashboard → Settings → Business settings → Currencies
- If PKR is not listed, contact Stripe support to enable it

---

### 3. **Frontend Environment Configuration**

#### Update `environment.production.ts`:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-backend-url.vercel.app/api',
  // ⚠️ Replace with your actual backend Vercel URL
};
```

**File location**: `assetloop-frontend/src/environments/environment.production.ts`

---

### 4. **CORS Configuration**

The backend already includes your frontend URL in CORS settings. Verify in `backend/server.js`:

```javascript
const allowedOrigins = [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "https://assetloop-rental-platform.vercel.app", // Your frontend URL
  process.env.FRONTEND_URL,
].filter(Boolean);
```

**Action**: Update the hardcoded frontend URL if different, or rely on `FRONTEND_URL` env variable.

---

### 5. **MongoDB Atlas (Production Database)**

#### A. Create Production Cluster:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (or use existing)
3. Set up database user with strong password
4. Whitelist IP addresses:
   - Add `0.0.0.0/0` to allow all IPs (for Vercel serverless)
   - Or add specific Vercel IP ranges

#### B. Get Connection String:
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Add to Vercel as `MONGO_URI`

---

### 6. **Build & Deploy**

#### Backend (Vercel):
```bash
cd backend
# Ensure vercel.json is configured correctly
vercel --prod
```

#### Frontend (Vercel):
```bash
cd assetloop-frontend
# Build for production
ng build --configuration production
# Deploy
vercel --prod
```

**Or use Vercel CLI/Git integration:**
- Connect your GitHub repository
- Vercel will auto-deploy on push to main branch
- Ensure build commands are set correctly in Vercel dashboard

---

### 7. **Post-Deployment Verification**

#### Test These Features:
- [ ] User registration and login
- [ ] Password reset email (if using SMTP)
- [ ] Asset listing and search
- [ ] Booking creation
- [ ] **Payment flow (CRITICAL)**:
  - [ ] Add money to wallet
  - [ ] Pay for booking
  - [ ] Verify redirects back to correct URL (not localhost)
  - [ ] Check webhook receives events
  - [ ] Verify transactions are created in database
  - [ ] Check wallet balance updates correctly

#### Check Logs:
- Backend logs in Vercel dashboard
- Stripe webhook logs in Stripe dashboard
- Check for any CORS errors
- Check for any database connection issues

---

### 8. **Security Checklist**

- [ ] All environment variables are set in Vercel (not in code)
- [ ] JWT_SECRET is strong and unique
- [ ] Stripe keys are LIVE keys (not test keys)
- [ ] MongoDB connection string uses strong password
- [ ] CORS is properly configured
- [ ] Frontend uses HTTPS
- [ ] Backend uses HTTPS
- [ ] No sensitive data in client-side code

---

### 9. **Monitoring & Error Handling**

#### Set Up:
- [ ] Error tracking (e.g., Sentry, LogRocket)
- [ ] Uptime monitoring
- [ ] Payment failure alerts
- [ ] Database backup strategy

---

## 🔧 Troubleshooting

### Issue: Payments redirect to localhost
**Solution**: 
- Check `FRONTEND_URL` environment variable in Vercel
- Verify frontend sends correct `successUrl`/`cancelUrl` in payment requests
- Check browser console for errors

### Issue: Webhook returns 404
**Solution**:
- Verify webhook URL in Stripe dashboard matches your backend URL
- Check that webhook route is defined before body parsers in `server.js`
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly

### Issue: CORS errors
**Solution**:
- Add your frontend URL to `allowedOrigins` in `server.js`
- Or set `FRONTEND_URL` environment variable
- Check Vercel logs for CORS errors

### Issue: Database connection fails
**Solution**:
- Verify `MONGO_URI` is correct in Vercel
- Check MongoDB Atlas IP whitelist includes Vercel IPs
- Verify database user has correct permissions

---

## 📝 Quick Reference

### Environment Variables Summary:

| Variable | Development | Production |
|----------|------------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from CLI) | `whsec_...` (from Dashboard) |
| `FRONTEND_URL` | `http://localhost:4200` | `https://your-frontend.vercel.app` |
| `MONGO_URI` | Local or test cluster | Production Atlas cluster |
| `JWT_SECRET` | Dev secret | Strong production secret |

---

## ✅ Final Checklist Before Going Live

- [ ] All test payments work correctly
- [ ] Webhook receives and processes events
- [ ] Transactions are created in database
- [ ] Wallet balances update correctly
- [ ] Email functionality works (if using)
- [ ] All environment variables are set
- [ ] Stripe is in LIVE mode
- [ ] Frontend builds and deploys successfully
- [ ] Backend deploys successfully
- [ ] No console errors in production
- [ ] CORS is properly configured
- [ ] Database backups are set up

---

## 🎉 You're Ready!

Once all items are checked, your application should be fully functional in production. Monitor the first few transactions closely to ensure everything works as expected.

