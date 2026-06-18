export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id">>;
      };
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Prompt, "id">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id">;
        Update: Partial<Omit<Category, "id">>;
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, "id" | "created_at">;
        Update: Partial<Omit<Collection, "id">>;
      };
      collection_prompts: {
        Row: CollectionPrompt;
        Insert: Omit<CollectionPrompt, "id">;
        Update: Partial<Omit<CollectionPrompt, "id">>;
      };
      likes: {
        Row: Like;
        Insert: Omit<Like, "id" | "created_at">;
        Update: Partial<Omit<Like, "id">>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at">;
        Update: Partial<Omit<Comment, "id">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id">>;
      };
      followers: {
        Row: Follower;
        Insert: Omit<Follower, "id" | "created_at">;
        Update: Partial<Omit<Follower, "id">>;
      };
      prompt_versions: {
        Row: PromptVersion;
        Insert: Omit<PromptVersion, "id" | "created_at">;
        Update: Partial<Omit<PromptVersion, "id">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at">;
        Update: Partial<Omit<Subscription, "id">>;
      };
      battles: {
        Row: Battle;
        Insert: Omit<Battle, "id" | "created_at">;
        Update: Partial<Omit<Battle, "id">>;
      };
      battle_votes: {
        Row: BattleVote;
        Insert: Omit<BattleVote, "id" | "created_at">;
        Update: Partial<Omit<BattleVote, "id">>;
      };
      discussions: {
        Row: Discussion;
        Insert: Omit<Discussion, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Discussion, "id">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id">>;
      };
      earnings: {
        Row: Earning;
        Insert: Omit<Earning, "id" | "created_at">;
        Update: Partial<Omit<Earning, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      prompt_model:
        | "chatgpt"
        | "claude"
        | "gemini"
        | "midjourney"
        | "flux"
        | "stable_diffusion"
        | "other";
      subscription_status: "active" | "canceled" | "past_due" | "trialing";
      battle_status: "pending" | "active" | "closed";
    };
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "creator" | "admin";
  is_premium: boolean;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  model: string;
  price: number;
  is_premium: boolean;
  is_featured: boolean;
  is_published: boolean;
  tags: string[];
  likes_count: number;
  saves_count: number;
  comments_count: number;
  views_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  prompt_count: number;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  prompt_count: number;
  created_at: string;
}

export interface CollectionPrompt {
  id: string;
  collection_id: string;
  prompt_id: string;
  added_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  prompt_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  prompt_id: string;
  rating: number;
  content: string | null;
  created_at: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  content: string;
  version_number: number;
  change_log: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  creator_id: string;
  status: string;
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface Battle {
  id: string;
  title: string;
  description: string | null;
  prompt_1_id: string;
  prompt_2_id: string;
  created_by: string;
  status: string;
  votes_1: number;
  votes_2: number;
  winner_id: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface BattleVote {
  id: string;
  battle_id: string;
  user_id: string;
  voted_for: string;
  created_at: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: string;
  tags: string[];
  upvotes: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Json | null;
  is_read: boolean;
  created_at: string;
}

export interface Earning {
  id: string;
  user_id: string;
  prompt_id: string;
  amount: number;
  type: "sale" | "subscription" | "tip";
  status: "pending" | "available" | "paid";
  created_at: string;
}
