// Generated from the Supabase "taaza" project schema (trimmed to what the app uses).
// Regenerate with: npx supabase gen types typescript --project-id eqwzvhaghhlhmxnjnico

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ItemStatus = "fresh" | "used" | "wasted" | "shared";
type StoragePlace = "fridge" | "pantry" | "freezer";
type ItemSource = "manual" | "fridge_photo" | "grocery_bill" | "order_screenshot";
type DietPref = "veg" | "non_veg" | "eggetarian" | "jain" | "vegan";
type AppLanguage = "en" | "hi";
type MemberRole = "owner" | "member";
type ShareStatus = "open" | "claimed" | "closed" | "expired";
type RequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      household_members: {
        Row: { household_id: string; joined_at: string; role: MemberRole; user_id: string };
        Insert: { household_id: string; joined_at?: string; role?: MemberRole; user_id: string };
        Update: { household_id?: string; joined_at?: string; role?: MemberRole; user_id?: string };
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      households: {
        Row: { created_at: string; created_by: string; id: string; name: string };
        Insert: { created_at?: string; created_by: string; id?: string; name?: string };
        Update: { created_at?: string; created_by?: string; id?: string; name?: string };
        Relationships: [];
      };
      items: {
        Row: {
          added_at: string;
          added_by: string | null;
          category: string | null;
          expires_on: string | null;
          household_id: string;
          id: string;
          name: string;
          place: StoragePlace;
          price_inr: number | null;
          quantity: number | null;
          source: ItemSource;
          status: ItemStatus;
          status_changed_at: string | null;
          unit: string | null;
        };
        Insert: {
          added_at?: string;
          added_by?: string | null;
          category?: string | null;
          expires_on?: string | null;
          household_id: string;
          id?: string;
          name: string;
          place?: StoragePlace;
          price_inr?: number | null;
          quantity?: number | null;
          source?: ItemSource;
          status?: ItemStatus;
          status_changed_at?: string | null;
          unit?: string | null;
        };
        Update: {
          added_at?: string;
          added_by?: string | null;
          category?: string | null;
          expires_on?: string | null;
          household_id?: string;
          id?: string;
          name?: string;
          place?: StoragePlace;
          price_inr?: number | null;
          quantity?: number | null;
          source?: ItemSource;
          status?: ItemStatus;
          status_changed_at?: string | null;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "items_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          diet: DietPref;
          email: string | null;
          full_name: string | null;
          id: string;
          language: AppLanguage;
          notifications_on: boolean;
          phone: string | null;
          reminder_time: string;
          streak_days: number;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          diet?: DietPref;
          email?: string | null;
          full_name?: string | null;
          id: string;
          language?: AppLanguage;
          notifications_on?: boolean;
          phone?: string | null;
          reminder_time?: string;
          streak_days?: number;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          diet?: DietPref;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          language?: AppLanguage;
          notifications_on?: boolean;
          phone?: string | null;
          reminder_time?: string;
          streak_days?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      share_posts: {
        Row: {
          approx_lat: number | null;
          approx_lng: number | null;
          area: string | null;
          cooked_at: string | null;
          created_at: string;
          details: string | null;
          id: string;
          pickup_by: string;
          status: ShareStatus;
          title: string;
          user_id: string;
        };
        Insert: {
          approx_lat?: number | null;
          approx_lng?: number | null;
          area?: string | null;
          cooked_at?: string | null;
          created_at?: string;
          details?: string | null;
          id?: string;
          pickup_by: string;
          status?: ShareStatus;
          title: string;
          user_id: string;
        };
        Update: {
          approx_lat?: number | null;
          approx_lng?: number | null;
          area?: string | null;
          cooked_at?: string | null;
          created_at?: string;
          details?: string | null;
          id?: string;
          pickup_by?: string;
          status?: ShareStatus;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      share_requests: {
        Row: { created_at: string; id: string; post_id: string; requester_id: string; status: RequestStatus };
        Insert: { created_at?: string; id?: string; post_id: string; requester_id: string; status?: RequestStatus };
        Update: { created_at?: string; id?: string; post_id?: string; requester_id?: string; status?: RequestStatus };
        Relationships: [
          {
            foreignKeyName: "share_requests_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "share_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      shelf_life: {
        Row: {
          category: string;
          food_name: string;
          freezer_days: number | null;
          fridge_days: number | null;
          pantry_days: number | null;
        };
        Insert: {
          category: string;
          food_name: string;
          freezer_days?: number | null;
          fridge_days?: number | null;
          pantry_days?: number | null;
        };
        Update: {
          category?: string;
          food_name?: string;
          freezer_days?: number | null;
          fridge_days?: number | null;
          pantry_days?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      household_monthly_stats: {
        Row: {
          household_id: string | null;
          items_saved: number | null;
          items_wasted: number | null;
          money_saved_inr: number | null;
          month: string | null;
        };
        Relationships: [];
      };
    };
    Functions: { [_ in never]: never };
    Enums: {
      app_language: AppLanguage;
      diet_pref: DietPref;
      item_source: ItemSource;
      item_status: ItemStatus;
      member_role: MemberRole;
      request_status: RequestStatus;
      share_status: ShareStatus;
      storage_place: StoragePlace;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];
export type ItemRow = PublicTables["items"]["Row"];
export type ProfileRow = PublicTables["profiles"]["Row"];
export type SharePostRow = PublicTables["share_posts"]["Row"];
export type DietPreference = DietPref;
export type Place = StoragePlace;
export type Source = ItemSource;
