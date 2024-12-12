import { Schema, model, models } from "mongoose";

const permissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "folders",
      required: true,
    },
  },
  { timestamps: true }
);

export const permissions =
  models.permissions || model("permissions", permissionSchema);
