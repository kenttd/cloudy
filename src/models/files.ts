import { Schema, model, Document, Types, models } from "mongoose";

interface IFile extends Document {
  user_id: Types.ObjectId;
  file_name: string;
  s3_key: string;
  file_size: number;
  content_type: string;
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at?: Date;
  folder_id?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const fileSchema = new Schema<IFile>({
  user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
  file_name: { type: String, required: true },
  s3_key: { type: String, required: true },
  file_size: { type: Number, required: true },
  content_type: { type: String, required: true },
  is_favorite: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date },
  folder_id: { type: Schema.Types.ObjectId, ref: "folders" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const files = models.files || model<IFile>("files", fileSchema);
