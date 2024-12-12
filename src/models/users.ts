import { Schema, model, Document, Types, models } from "mongoose";

// Define the TypeScript interface for the User model
interface IUser extends Document {
  google_id: string;
  email: string;
  name: string;
  avatar?: string;
  storage_limit: number;
  used_storage: number;
  role: "user" | "admin" | "superadmin";
  created_at: Date;
  updated_at: Date;
}

// Define the Mongoose schema for the User model
const userSchema = new Schema<IUser>({
  google_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
  storage_limit: { type: Number, default: 10 * 1024 * 1024 * 1024 }, // 10GB in bytes
  used_storage: { type: Number, default: 0 },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Export the model
export const users = models.users || model<IUser>("users", userSchema);
