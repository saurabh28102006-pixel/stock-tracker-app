import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface HoldingItem {
  symbol: string;
  company: string;
  shares: number;
  avgBuyPrice: number;
}

export interface PortfolioDocument extends Document {
  userId: string;
  cashBalance: number;
  holdings: HoldingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const HoldingSchema = new Schema<HoldingItem>(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    shares: { type: Number, required: true, min: 0 },
    avgBuyPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PortfolioSchema = new Schema<PortfolioDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    cashBalance: { type: Number, required: true, default: 100000 },
    holdings: { type: [HoldingSchema], default: [] },
  },
  { timestamps: true }
);

export const Portfolio: Model<PortfolioDocument> =
  (models?.Portfolio as Model<PortfolioDocument>) ||
  model<PortfolioDocument>('Portfolio', PortfolioSchema);
