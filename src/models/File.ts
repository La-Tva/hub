import mongoose, { Schema, model, models } from 'mongoose';

const FileSchema = new Schema({
  name: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  userId: { type: String }, // Optional, to link to a user
}, { timestamps: true });

const FileModel = models.File || model('File', FileSchema);

export default FileModel;
