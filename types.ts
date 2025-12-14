export interface User {
  id: string;
  handle: string;
  email: string;
  full_name?: string;
  school: string;
  avatar_url?: string;
  cover_url?: string; // Custom profile cover image

  xp: number;
  rating?: number;
  projects_completed?: number;
  portfolio?: string[]; // Array of image URLs (Handwriting samples)
  rate_per_page?: number; // Optional: For future expansion
  is_writer?: boolean; // Toggle: Is the user open to work?
  bio?: string; // Short pitch: "I have neat handwriting"
  tags?: string[]; // e.g., ['Math', 'CS', 'English']
  saved_writers?: string[]; // IDs of writers this user has bookmarked
  is_incomplete?: boolean; // Flag for Google users who haven't set handle/school
  fcm_token?: string; // Firebase Cloud Messaging Token for Push Notifications
  visibility?: 'global' | 'college'; // Visibility setting for the profile
  role?: 'user' | 'admin' | 'moderator'; // Role-based access control
}

export interface Chat {
  id: string;
  gig_id?: string; // Kept for legacy compatibility
  poster_id: string;
  writer_id: string;
  gig_title?: string;
  other_handle?: string;
  last_message?: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'FILE';
  created_at: string;
  read_at?: string; // ISO Timestamp when the message was read
}

export enum GigStatus {
  LIVE = 'LIVE',
  TAKEN = 'TAKEN',
  COMPLETED = 'COMPLETED'
}

export interface Gig {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  budget: number;
  subject: string;
  status: GigStatus;
  created_at: string;
  poster_avatar?: string;
  poster_handle?: string;
  school?: string;
  attachment_url?: string;
}

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  requester?: User; // Joined data for UI
  receiver?: User; // Joined data for UI
}