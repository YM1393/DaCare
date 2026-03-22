export interface StoredUser {
  _id: string;
  id?: string;
  name: string;
  role: 'user' | 'mother' | 'helper' | 'admin';
  email: string;
  profileImage?: string | null;
  helperType?: string;
}

export interface Helper {
  _id?: string;
  id: string;
  name?: string;
  email?: string;
  area?: string;
  price?: string;
  experience?: string;
  intro?: string;
  helperType?: string;
  specialties?: string[];
  certifications?: string[];
  portfolioImages?: string[];
  profileImage?: string | null;
  rating?: string;
  reviewCount?: number;
  approved?: boolean;
  score?: number;
}

export interface Review {
  _id: string;
  id?: string;
  helperId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Reservation {
  _id: string;
  userEmail?: string;
  helperName?: string;
  helperId?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface Notification {
  _id: string;
  id?: string;
  userEmail: string;
  message: string;
  read: boolean;
  date: string;
}

export interface Post {
  _id: string;
  id?: string;
  title: string;
  content: string;
  author: string;
  category: string;
  imageUrl?: string;
  tags?: string[];
  likes?: number;
  likedBy?: string[];
  createdAt: string;
  comments?: PostComment[];
}

export interface PostComment {
  _id: string;
  postId?: string;
  authorEmail?: string;
  authorName?: string;
  content: string;
  createdAt: string;
}

export interface DirectMessage {
  _id: string;
  roomId: string;
  senderEmail?: string;
  senderName?: string;
  message?: string;
  read?: boolean;
  createdAt: string;
}

/** @deprecated Use DirectMessage */
export type Message = DirectMessage;

export interface ChatRoom {
  _id: string;
  id?: string;
  motherEmail?: string;
  helperId?: string;
  helperName?: string;
  motherName?: string;
  createdAt?: string;
  latestMessage?: DirectMessage | null;
  unreadCount?: number;
}

/** @deprecated Use ChatRoom */
export type Room = ChatRoom;

export interface GrowthRecord {
  _id: string;
  userEmail?: string;
  babyName?: string;
  date: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
  notes?: string;
  createdAt?: string;
}

export interface SleepRecord {
  _id: string;
  email?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt?: string;
}

export interface WeightRecord {
  _id: string;
  email?: string;
  weight: number;
  date: string;
  createdAt?: string;
}

export interface DiaperLog {
  _id: string;
  email?: string;
  type?: string;
  notes?: string;
  createdAt?: string;
}

export interface EmotionLog {
  _id: string;
  email?: string;
  date: string;
  mood: number;
  note?: string;
  createdAt?: string;
}

export interface HealthEntry {
  _id: string;
  userEmail?: string;
  date: string;
  mood?: number;
  sleep?: number;
  water?: number;
  symptoms?: string[];
  notes?: string;
  createdAt?: string;
}

export interface Favorite {
  _id: string;
  motherEmail?: string;
  userEmail?: string;
  helperId: string;
  helperName?: string;
  createdAt?: string;
}

export interface GrowthPhoto {
  _id: string;
  email?: string;
  imageBase64?: string;
  date?: string;
  createdAt?: string;
}

/** Reminder is a Reservation used as an upcoming reminder */
export type Reminder = Reservation;
