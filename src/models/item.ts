import { InferSchemaType, model, Schema } from "mongoose";
import { encrypt, decrypt } from "../util/crypto";

const itemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    category: {
      type: String,
      enum: ["Work", "Personal", "Social", "Banking", "Other", "No category"],
      default: "No category",
    },
    url: { type: String },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

type Item = InferSchemaType<typeof itemSchema>;

export default model<Item>("Item", itemSchema);
