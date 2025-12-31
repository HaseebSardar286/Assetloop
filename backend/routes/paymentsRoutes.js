const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createCheckoutSession,
  getWallet,
  addMoney,
  withdraw,
  getTransactions,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getInvoices,
  getRefunds,
  testBookingPayment,
  testWalletTopup,
  verifyPayment,
} = require("../controllers/paymentsController");

const router = express.Router();

/**
 * ⚠️ NOTE: Webhook route is defined in server.js BEFORE body parsers
 * All routes here will have access to parsed JSON body via express.json()
 */

/**
 * 🔐 AUTHENTICATED ROUTES
 * All routes require authentication
 */
router.use(authMiddleware);

// Booking Payment
router.post("/create-checkout-session", createCheckoutSession);

// Wallet
router.get("/wallet", getWallet);
router.post("/wallet/add", addMoney);
router.post("/wallet/withdraw", withdraw);
router.get("/verify-payment", verifyPayment);

// Transactions
router.get("/transactions", getTransactions);

// Payment Methods
router.get("/methods", getPaymentMethods);
router.post("/methods", addPaymentMethod);
router.delete("/methods/:id", removePaymentMethod);
router.post("/methods/:id/default", setDefaultPaymentMethod);

// Invoices & Refunds
router.get("/invoices", getInvoices);
router.get("/refunds", getRefunds);

// Test payment endpoints (for development)
router.post("/test/booking-payment", testBookingPayment);
router.post("/test/wallet-topup", testWalletTopup);

module.exports = router;