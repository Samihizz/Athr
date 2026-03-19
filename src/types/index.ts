export type { Locale } from "@/i18n/config";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  expertise: string | null;
  role: string | null;
  want_to_learn: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  profile_complete: boolean;
  bio: string | null;
  education: string | null;
  experience: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  is_mentor: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  track: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  profile_id: string;
  created_at: string;
}

export interface ContentPost {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  category: string;
  track: string | null;
  author_id: string;
  is_pinned: boolean;
  is_published: boolean;
  external_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  is_active: boolean;
  created_at: string;
}

export interface MentorConnection {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'event_registration' | 'new_post' | 'mentor_request' | 'announcement' | 'welcome';
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface CommunityStats {
  total_members: number;
  track_ai: number;
  track_creative: number;
  track_business: number;
  track_marketing: number;
  track_finance: number;
  track_tech: number;
  city_dammam: number;
  city_khobar: number;
  city_alahsa: number;
  city_dhahran: number;
  mentors: number;
  learners: number;
}
