import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface TradeDocument extends Document {
  userId: string;
  symbol: string;
  company: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  totalAmount: number;
  executedAt: Date;
}

const TradeSchema = new Schema<TradeDocument>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    shares: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Trade: Model<TradeDocument> =
  (models?.Trade as Model<TradeDocument>) || model<TradeDocument>('Trade', TradeSchema);
