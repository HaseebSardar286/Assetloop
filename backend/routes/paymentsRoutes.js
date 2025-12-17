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
} = require("../controllers/paymentsController");

const router = express.Router();

// Authenticated routes
router.use(authMiddleware);

// Booking Payment
router.post("/create-checkout-session", createCheckoutSession);

// Wallet
router.get("/wallet", getWallet);
router.post("/wallet/add", addMoney);
router.post("/wallet/withdraw", withdraw);

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

module.exports = router;
