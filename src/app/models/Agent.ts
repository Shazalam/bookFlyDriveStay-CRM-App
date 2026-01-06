import mongoose, { Schema, Document } from "mongoose";

export interface IAgent extends Document {
  name: string;
  email: string;
  password: string;
  role: "Agent" | "SuperAdmin";
  isAllowed:boolean
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Agent", "SuperAdmin"], default: "Agent" },
    isAllowed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);
