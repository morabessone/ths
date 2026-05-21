export type VideoLevel = 'beginner' | 'intermediate' | 'advanced';

export interface EducationCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  cover_color: string;
  order_index: number;
  published: boolean;
  created_at: string;
  video_count?: number;
  watched_count?: number;
}

export interface EducationVideo {
  id: string;
  category_id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  instructor: string | null;
  instructor_bio: string | null;
  duration_min: number | null;
  level: VideoLevel;
  tags: string[];
  is_premium: boolean;
  featured: boolean;
  order_index: number;
  published: boolean;
  created_at: string;
  category?: Pick<EducationCategory, 'name' | 'emoji' | 'slug'> | null;
  watched?: boolean;
  saved?: boolean;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  watched: boolean;
  saved: boolean;
  watched_at: string | null;
}

export type LevelFilter = 'all' | VideoLevel;
