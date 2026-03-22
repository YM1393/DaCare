import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: String,
  approved: { type: Boolean, default: false },
  area: String,
  price: String,
  experience: String,
  intro: String,
  profileImage: { type: String, default: null },
  helperType: { type: String, default: '' },
  specialties: [String],
  certifications: [String],
  portfolioImages: [String],
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  authorEmail: String,
  category: String,
  imageUrl: String,
  tags: [String],
  likes: { type: Number, default: 0 },
  likedBy: [String],
  createdAt: { type: Date, default: Date.now },
});
export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

const commentSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  authorEmail: String,
  authorName: String,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

const reservationSchema = new mongoose.Schema({
  userEmail: String,
  helperName: String,
  helperId: String,
  date: String,
  status: { type: String, default: 'pending' },
});
export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

const reviewSchema = new mongoose.Schema({
  helperId: String,
  userEmail: String,
  user: String,
  rating: Number,
  comment: String,
  date: { type: String, default: () => new Date().toLocaleDateString() },
  createdAt: { type: Date, default: Date.now },
});
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

const checkInSchema = new mongoose.Schema({
  helperId: { type: String, required: true },
  helperEmail: String,
  helperName: String,
  motherEmail: String,
  reservationId: String,
  date: { type: String, required: true },
  checkInTime: String,
  checkOutTime: String,
  createdAt: { type: Date, default: Date.now },
});
export const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);

const notificationSchema = new mongoose.Schema({
  userEmail: String,
  message: String,
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const healthJournalSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  date: { type: String, required: true },
  mood: { type: Number, default: 3 },
  sleep: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  symptoms: [String],
  notes: String,
  createdAt: { type: Date, default: Date.now },
});
export const HealthJournal = mongoose.models.HealthJournal || mongoose.model('HealthJournal', healthJournalSchema);

const growthRecordSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  babyName: { type: String, default: '아기' },
  date: { type: String, required: true },
  weight: Number,
  height: Number,
  headCircumference: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});
export const GrowthRecord = mongoose.models.GrowthRecord || mongoose.model('GrowthRecord', growthRecordSchema);

const chatRoomSchema = new mongoose.Schema({
  motherEmail: { type: String, required: true },
  helperId: { type: String, required: true },
  helperName: String,
  motherName: String,
  createdAt: { type: Date, default: Date.now },
});
export const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);

const directMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderEmail: String,
  senderName: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
export const DirectMessage = mongoose.models.DirectMessage || mongoose.model('DirectMessage', directMessageSchema);

const favoriteSchema = new mongoose.Schema({
  motherEmail: { type: String, required: true },
  helperId: { type: String, required: true },
  helperName: String,
  createdAt: { type: Date, default: Date.now },
});
export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);

const pushSubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscription: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now },
});
export const PushSubscription = mongoose.models.PushSubscription || mongoose.model('PushSubscription', pushSubscriptionSchema);

const diaperLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, enum: ['소변', '대변', '혼합'], default: '소변' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});
export const DiaperLog = mongoose.models.DiaperLog || mongoose.model('DiaperLog', diaperLogSchema);

const sleepRecordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  startTime: String,
  endTime: String,
  duration: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});
export const SleepRecord = mongoose.models.SleepRecord || mongoose.model('SleepRecord', sleepRecordSchema);

const growthPhotoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  imageBase64: String,
  date: { type: String, default: () => new Date().toLocaleDateString() },
  createdAt: { type: Date, default: Date.now },
});
export const GrowthPhoto = mongoose.models.GrowthPhoto || mongoose.model('GrowthPhoto', growthPhotoSchema);

const weightRecordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  weight: { type: Number, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const WeightRecord = mongoose.models.WeightRecord || mongoose.model('WeightRecord', weightRecordSchema);

const emotionLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true },
  mood: { type: Number, required: true, min: 1, max: 5 },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
export const EmotionLog = mongoose.models.EmotionLog || mongoose.model('EmotionLog', emotionLogSchema);
