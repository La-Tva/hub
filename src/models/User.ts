import mongoose, { Schema, model, models } from 'mongoose';

const AppSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
});

const WidgetSchema = new Schema({
  type: { type: String, required: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  config: { type: Schema.Types.Mixed, default: {} },
});

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  image: { type: String },
  settings: {
    wallpaper: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1614850523296-d861d993c9ef?q=80&w=2070&auto=format&fit=crop' 
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    clockFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
    wallpaperHistory: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  apps: { type: [AppSchema], default: [] },
  widgets: { type: [WidgetSchema], default: [] },
}, { timestamps: true, collection: 'hub' });

const User = models.User || model('User', UserSchema);

export default User;
