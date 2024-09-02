"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentResponse = void 0;
const mongoose_1 = require("mongoose");
const PaymentInstrumentSchema = new mongoose_1.Schema({
    type: { type: String },
    utr: { type: String },
    cardNetwork: { type: String },
    accountType: { type: String },
});
const FeesContextSchema = new mongoose_1.Schema({
    amount: { type: Number, default: 0 },
});
const PaymentResponseSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    success: { type: Boolean },
    code: { type: String },
    message: { type: String },
    BookingId: {
        type: Number,
    },
    data: {
        merchantId: { type: String },
        merchantTransactionId: { type: String },
        transactionId: { type: String },
        amount: { type: Number },
        state: { type: String },
        responseCode: { type: String },
        paymentInstrument: { type: PaymentInstrumentSchema },
        feesContext: { type: FeesContextSchema },
    },
});
exports.PaymentResponse = (0, mongoose_1.model)("PaymentResponse", PaymentResponseSchema);
