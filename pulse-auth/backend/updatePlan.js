import mongoose from 'mongoose';
import Subscription from './src/models/Subscription.js';
import dotenv from 'dotenv';
dotenv.config();

async function updatePlan() {
    await mongoose.connect(process.env.MONGODB_URI);
    await Subscription.updateMany({}, { $set: { price: 99000, currency: "VND" } });
    console.log("Updated plans successfully.");
    process.exit(0);
}

updatePlan();
