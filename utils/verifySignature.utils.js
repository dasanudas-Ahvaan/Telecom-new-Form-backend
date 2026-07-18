const crypto = require("crypto");

// Webhook validation signature
module.exports = (rawBody, signature) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody) // Pass the raw Buffer here
        .digest("hex");

    return expectedSignature === signature;
};