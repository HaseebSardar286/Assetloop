# 🔍 Wallet Balance Update Debugging Guide

## Quick Debugging Steps

### Step 1: Check Browser Console
After making a payment, open browser DevTools (F12) → Console tab and look for:

**Expected logs:**
```
🔍 Payment redirect params: {status: "success", session_id: "cs_...", source: "wallet_topup"}
✅ Payment success detected, verifying session: cs_...
🔍 Verifying payment with session ID: cs_...
📦 Verification response: {success: true, balance: 100, ...}
✅ Payment verified: Payment verified and wallet updated
💰 New balance: 100
🔄 Refreshing wallet...
```

**If you see errors:**
- `❌ Error verifying payment:` - Check the error message
- `⚠️ Payment verification failed:` - Payment might not be completed
- No logs at all - Component might not be loading

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "verify-payment"
3. After payment, check:
   - **Request URL**: Should be `/api/payments/verify-payment?sessionId=cs_...`
   - **Status**: Should be 200
   - **Response**: Should have `success: true`

**If you see 404:**
- Backend route might not be deployed
- Check Vercel deployment

**If you see 401:**
- Authentication token might be missing
- Check if user is logged in

**If you see 500:**
- Check Vercel function logs for error details

### Step 3: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Look for recent function executions
3. Check for these logs:

**Webhook logs (if webhook is working):**
```
🔔 Webhook received!
✅ Webhook signature verified
📦 Event type: checkout.session.completed
Processing wallet topup for user: 694242d9a44994f6ea454101
✅ Wallet balance updated: 0 → 100 (+100)
✅ Transaction created: ...
```

**Verification logs:**
```
🔍 Verifying payment session: cs_...
Session status: paid
Session metadata: {userId: "694242d9a44994f6ea454101", type: "wallet_topup"}
💰 Processing wallet topup: User 694242d9a44994f6ea454101, Amount: 100, Current Balance: 0
✅ Wallet balance updated via verification: 0 → 100 (+100)
✅ Transaction created via verification: ...
```

### Step 4: Check Stripe Dashboard
1. Go to Stripe Dashboard → Payments
2. Find your test payment
3. Check:
   - **Status**: Should be "Succeeded"
   - **Webhooks**: Click on the payment → "Webhooks" tab
   - **Delivery status**: Should show if webhook was sent and response code

### Step 5: Verify Environment Variables
In Vercel Dashboard → Settings → Environment Variables, check:
- ✅ `STRIPE_SECRET_KEY` - Should be set (test or live key)
- ✅ `STRIPE_WEBHOOK_SECRET` - Should be set (from Stripe webhook endpoint)
- ✅ `MONGO_URI` - Should be set
- ✅ `JWT_SECRET` - Should be set

---

## Common Issues & Solutions

### Issue 1: No session_id in URL
**Symptom**: Console shows `⚠️ Success status but no session_id or source`

**Cause**: Stripe didn't append session_id to redirect URL

**Solution**: 
- Check that success URL includes `{CHECKOUT_SESSION_ID}` placeholder
- Verify backend is using the correct success URL format
- The code should now handle this - check browser console for fallback refresh

### Issue 2: Verification returns 404
**Symptom**: Network tab shows 404 for verify-payment request

**Cause**: Route not deployed or incorrect path

**Solution**:
1. Verify `backend/routes/paymentsRoutes.js` has the route
2. Check `backend/controllers/paymentsController.js` exports `verifyPayment`
3. Redeploy backend to Vercel

### Issue 3: Verification returns 403
**Symptom**: Network tab shows 403 Unauthorized

**Cause**: User ID mismatch between session metadata and authenticated user

**Solution**:
- Check Vercel logs for user ID comparison
- Verify metadata.userId matches req.user.id
- Check if user is logged in correctly

### Issue 4: Payment verified but balance not updating
**Symptom**: Verification succeeds but wallet balance stays the same

**Possible causes**:
1. **Database not saving**: Check Vercel logs for save errors
2. **Wrong user being updated**: Check user ID in logs
3. **Transaction already exists**: Check for duplicate transaction prevention logs
4. **Frontend not refreshing**: Check if `loadWallet()` is being called

**Solution**:
- Check Vercel logs for `✅ Wallet balance updated` message
- Verify the user ID in the logs matches your user
- Check database directly if possible
- Try clicking "Refresh" button manually

### Issue 5: Webhook not being received
**Symptom**: No webhook logs in Vercel, but payment succeeded in Stripe

**Causes**:
1. Webhook URL incorrect in Stripe Dashboard
2. Webhook secret mismatch
3. Webhook endpoint returning error

**Solution**:
1. **Check webhook URL in Stripe**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Verify endpoint URL: `https://your-backend-url.vercel.app/api/payments/stripe/webhook`
   - No trailing slash, correct path

2. **Check webhook secret**:
   - In Stripe Dashboard → Webhook endpoint → "Reveal" signing secret
   - Copy and verify it matches `STRIPE_WEBHOOK_SECRET` in Vercel

3. **Test webhook**:
   - In Stripe Dashboard → Webhook endpoint → "Send test webhook"
   - Check Vercel logs for receipt

4. **Check webhook events**:
   - Ensure `checkout.session.completed` is selected
   - Check "Recent deliveries" for any failed attempts

### Issue 6: "Transaction already processed"
**Symptom**: Verification returns `alreadyProcessed: true` but balance didn't update

**Cause**: Transaction was created but wallet wasn't updated (webhook might have failed partway)

**Solution**:
- Check database for transaction with matching `stripePaymentIntentId`
- Check if user's `walletBalance` was actually updated
- If transaction exists but balance wasn't updated, manually fix in database or add a repair script

---

## Manual Testing Steps

### Test 1: Direct API Call
Use Postman or curl to test verification endpoint:

```bash
# Replace with your actual values
curl -X GET "https://your-backend.vercel.app/api/payments/verify-payment?sessionId=cs_test_..." \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Payment verified and wallet updated",
  "balance": 100,
  "amount": 100,
  "alreadyProcessed": false
}
```

### Test 2: Check Database Directly
If you have MongoDB access:
```javascript
// Find user
db.users.findOne({ email: "your-email@example.com" })
// Check walletBalance field

// Find transactions
db.transactions.find({ user: ObjectId("user-id") }).sort({ createdAt: -1 })
// Check for recent deposit transaction
```

### Test 3: Test Webhook Manually
Use Stripe CLI (if testing locally):
```bash
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
```

Or use Stripe Dashboard → Webhooks → "Send test webhook"

---

## Debugging Checklist

- [ ] Browser console shows payment verification logs
- [ ] Network tab shows verify-payment request with 200 status
- [ ] Vercel logs show webhook or verification processing
- [ ] Stripe Dashboard shows payment as "Succeeded"
- [ ] Stripe Dashboard shows webhook was sent (if configured)
- [ ] Environment variables are set correctly in Vercel
- [ ] User is authenticated (JWT token present)
- [ ] Database connection is working
- [ ] No duplicate transaction errors in logs
- [ ] Wallet refresh is being called after verification

---

## Still Not Working?

If none of the above helps, collect this information:

1. **Browser Console logs** (screenshot or copy)
2. **Network tab** - verify-payment request/response (screenshot)
3. **Vercel Function logs** - last 10-20 log entries
4. **Stripe Dashboard** - Payment details and webhook delivery status
5. **Environment variables** - List of what's set (without values)
6. **Payment amount** and **session ID** (from URL or Stripe)

Then check:
- Is the verification endpoint being called?
- Is it returning success?
- Are there any errors in Vercel logs?
- Is the webhook being received?
- Is the database being updated?

---

## Quick Fix: Manual Refresh

If payment succeeded but balance didn't update:
1. Click the "Refresh" button in the wallet overview
2. Wait 2-3 seconds
3. Check if balance updates

If it updates after refresh, the issue is likely:
- Verification not being called automatically
- Component not refreshing after verification
- Timing issue with webhook

---

## Next Steps After Debugging

Once you identify the issue:
1. Fix the root cause (webhook, verification, database, etc.)
2. Test with a small amount (PKR 1.00)
3. Verify balance updates correctly
4. Check transaction history shows the deposit
5. Test again with a larger amount to confirm

