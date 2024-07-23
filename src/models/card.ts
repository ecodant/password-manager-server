import { InferSchemaType, model, Schema } from "mongoose";
import { encrypt } from "../util/crypto";

export enum Brands {
  Visa = "Visa",
  Mastercard = "Mastercard",
  AmericanExpress = "American Express",
  Discocer = "Discover",
  DinersClub = "Diners CLub",
  JCB = "JCB",
  UnionPlay = "UnionPLay",
  Ruplay = "RuPlay",
  Other = "Other",
}

export enum Years {
  Y2024 = "2024",
  Y2025 = "2025",
  Y2026 = "2026",
  Y2027 = "2027",
  Y2028 = "2028",
  Y2029 = "2029",
  Y2030 = "2030",
  Y2031 = "2031",
  Y2032 = "2032",
  Y2033 = "2033",
  Y2034 = "2034",
}

export enum Months {
  January = "January (01)",
  February = "February (02)",
  March = "March (03)",
  April = "April (04)",
  May = "May (05)",
  June = "June (06)",
  July = "July (07)",
  August = "August (08)",
  September = "September (09)",
  October = "October (10)",
  November = "November (11)",
  December = "December (12)",
}
const cardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiredMonth: { type: String, required: true },
    expiredYear: { type: String, required: true },
    cardCode: { type: String, required: true },
    brand: {
      type: String,
      enum: Brands,
      default: "Other",
    },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

type Card = InferSchemaType<typeof cardSchema>;

export default model<Card>("Card", cardSchema);
