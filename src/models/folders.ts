import { Schema, model, Document, Types, models } from "mongoose";

interface IFolder extends Document {
  user_id: Types.ObjectId;
  folder_name: string;
  parent_folder?: Types.ObjectId;
  is_favorite: boolean;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

const folderSchema = new Schema<IFolder>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  folder_name: { type: String, required: true },
  parent_folder: { type: Schema.Types.ObjectId, ref: "folders" },
  is_favorite: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: false },
});

export const folders =
  models.folders || model<IFolder>("folders", folderSchema);
