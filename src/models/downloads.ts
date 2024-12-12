import { Schema, model, Document, Types } from "mongoose";

interface IDownloadLog extends Document {
  file_id: Types.ObjectId;
  user_id: Types.ObjectId;
  download_time: Date;
}

const downloadLogSchema = new Schema<IDownloadLog>({
  file_id: { type: Schema.Types.ObjectId, ref: "File", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  download_time: { type: Date, default: Date.now },
});

export const DownloadLog = model<IDownloadLog>(
  "DownloadLog",
  downloadLogSchema
);
