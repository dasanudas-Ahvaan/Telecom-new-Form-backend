const crypto = require("crypto");

module.exports = (
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
) => {

    const body =
        razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(body.toString())
        .digest("hex");

    return expectedSignature === razorpaySignature;

};