import { Schema, Document, model } from "mongoose";

export interface PaymentInstrument {
  type: string;
  utr: string;
  cardNetwork: string;
  accountType: string;
}

export interface FeesContext {
  amount: number;
}

export interface TransactionDocument extends Document {
  userId: Schema.Types.ObjectId;
  BookingId: number;
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument: PaymentInstrument;
    feesContext: FeesContext;
  };
}

const PaymentInstrumentSchema = new Schema<PaymentInstrument>({
  type: { type: String},
  utr: { type: String},
  cardNetwork: { type: String},
  accountType: { type: String},
});

const FeesContextSchema = new Schema<FeesContext>({
  amount: { type: Number, default: 0 },
});

const TransactionSchema = new Schema<TransactionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  success: { type: Boolean},
  code: { type: String},
  message: { type: String},
  BookingId: {
    type: Number,
  },
  data: {
    merchantId: { type: String},
    merchantTransactionId: { type: String},
    transactionId: { type: String},
    amount: { type: Number},
    state: { type: String},
    responseCode: { type: String},
    paymentInstrument: { type: PaymentInstrumentSchema},
    feesContext: { type: FeesContextSchema},
  },
});

export const Transaction = model<TransactionDocument>(
  "Transaction",
  TransactionSchema
);
