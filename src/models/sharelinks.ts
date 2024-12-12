import { Schema, model, Document, Types } from "mongoose";

interface IShareLink extends Document {
  file_id: Types.ObjectId;
  user_id: Types.ObjectId;
  access_limit?: number;
  download_count: number;
  views_count: number;
  is_active: boolean;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const shareLinkSchema = new Schema<IShareLink>({
  file_id: { type: Schema.Types.ObjectId, ref: "File", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  access_limit: { type: Number, default: null },
  download_count: { type: Number, default: 0 },
  views_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const ShareLink = model<IShareLink>("ShareLink", shareLinkSchema);
