import mongoose from "mongoose";

/**
 * Subscription package definition (i.e., the available plans).
 * Seeded once; admins can update price/features without redeploying.
 */
const subscriptionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        planKey: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "USD",
        },

        billingPeriod: {
            type: String,
            enum: ["monthly", "yearly", "lifetime"],
            default: "monthly",
        },

        features: {
            type: [String],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// ── Seed default plan if collection is empty ──────────────────────────────────
export async function seedDefaultPlan() {
    const count = await Subscription.countDocuments();
    if (count === 0) {
        await Subscription.create({
            name: "Premium",
            planKey: "premium",
            price: 99000,
            currency: "VND",
            billingPeriod: "monthly",
            features: [
                "Unlimited song skipping",
                "Full playlist listening",
                "HD audio quality",
                "AI-powered music recommendations",
                "Shared listening sessions",
                "Ad-free experience",
                "Download songs for offline listening",
            ],
        });
        console.log("✅ Default Premium plan seeded.");
    }
}

export default Subscription;
