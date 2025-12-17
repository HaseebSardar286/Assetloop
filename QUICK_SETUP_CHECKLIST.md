# Quick Payment Setup Checklist ⚡

## Essential Steps (5 minutes)

### 1. Stripe Account Setup
- [ ] Create Stripe account at https://stripe.com
- [ ] Get Test API keys from Dashboard → Developers → API keys
- [ ] Copy Secret Key (`sk_test_...`)

### 2. Backend Configuration
- [ ] Create/update `backend/.env` file
- [ ] Add `STRIPE_SECRET_KEY=sk_test_your_key`
- [ ] Install Stripe CLI: `stripe login`
- [ ] Run: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- [ ] Copy webhook secret (`whsec_...`) from CLI output
- [ ] Add `STRIPE_WEBHOOK_SECRET=whsec_your_secret` to `.env`

### 3. Test Payment
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd assetloop-frontend && ng serve`
- [ ] Keep Stripe CLI running
- [ ] Test payment with card: `4242 4242 4242 4242`
- [ ] Verify transaction created in database

## That's It! 🎉

**Full detailed guide:** See `PAYMENT_SETUP_GUIDE.md`

## Common Issues

| Issue | Quick Fix |
|-------|-----------|
| "Missing STRIPE_SECRET_KEY" | Add to `.env` file |
| Webhook errors | Check webhook secret matches CLI output |
| No transactions created | Ensure Stripe CLI is running |
| CORS errors | Add frontend URL to `CORS_ORIGINS` |

