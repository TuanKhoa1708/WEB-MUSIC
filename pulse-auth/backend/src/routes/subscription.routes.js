import express from "express";
import {
    getPackages,
    getMySubscription,
    checkout,
    demoConfirmPayment,
    activateSubscription,
    cancelSubscription,
} from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public — anyone can view available plans
router.get("/packages", getPackages);

// Protected — user must be logged in
router.get("/me", protect, getMySubscription);
router.post("/checkout", protect, checkout);
router.post("/demo-confirm", protect, demoConfirmPayment);
router.post("/activate", protect, activateSubscription); // TODO: add webhook secret middleware
router.delete("/me", protect, cancelSubscription);

export default router;
