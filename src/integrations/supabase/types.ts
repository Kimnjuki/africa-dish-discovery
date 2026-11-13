export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      affiliate_suppliers: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string | null
          region: string | null
          supplier_name: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id?: string | null
          region?: string | null
          supplier_name: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string | null
          region?: string | null
          supplier_name?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_suppliers_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          requirements_json: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          requirements_json?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          requirements_json?: Json | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_name?: string | null
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          replied_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          replied_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          replied_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      cultural_stories: {
        Row: {
          audio_url: string | null
          author_name: string | null
          author_role: string | null
          content: string
          created_at: string | null
          dish_id: string | null
          id: string
          images: string[] | null
          is_verified: boolean | null
          language: string | null
          recipe_id: string | null
          sources: Json
          story_type: string
          title: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          audio_url?: string | null
          author_name?: string | null
          author_role?: string | null
          content: string
          created_at?: string | null
          dish_id?: string | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          language?: string | null
          recipe_id?: string | null
          sources?: Json
          story_type: string
          title: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          audio_url?: string | null
          author_name?: string | null
          author_role?: string | null
          content?: string
          created_at?: string | null
          dish_id?: string | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          language?: string | null
          recipe_id?: string | null
          sources?: Json
          story_type?: string
          title?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_stories_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_stories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_stories_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      discover_filters: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_featured: boolean | null
          name: string
          order_priority: number | null
          region_id: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          order_priority?: number | null
          region_id?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          order_priority?: number | null
          region_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discover_filters_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          audio_pronunciation_url: string | null
          continent: string | null
          country: string | null
          created_at: string | null
          cultural_significance: string | null
          cultural_sources: Json
          id: string
          name: string
          original_name_native: string | null
          phonetic_spelling: string | null
          primary_tribe_ethnicity: string | null
          region: string | null
          slug: string | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          audio_pronunciation_url?: string | null
          continent?: string | null
          country?: string | null
          created_at?: string | null
          cultural_significance?: string | null
          cultural_sources?: Json
          id?: string
          name: string
          original_name_native?: string | null
          phonetic_spelling?: string | null
          primary_tribe_ethnicity?: string | null
          region?: string | null
          slug?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_pronunciation_url?: string | null
          continent?: string | null
          country?: string | null
          created_at?: string | null
          cultural_significance?: string | null
          cultural_sources?: Json
          id?: string
          name?: string
          original_name_native?: string | null
          phonetic_spelling?: string | null
          primary_tribe_ethnicity?: string | null
          region?: string | null
          slug?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          collection_name: string | null
          created_at: string | null
          id: string
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          collection_name?: string | null
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          collection_name?: string | null
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          household_id: string
          id?: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          household_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
          share_pantry: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          name: string
          share_pantry?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
          share_pantry?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ingredient_substitutions: {
        Row: {
          compatibility_score: number | null
          created_at: string | null
          id: string
          notes: string | null
          original_ingredient_id: string
          quantity_ratio: number | null
          reason: string
          substitute_ingredient_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          original_ingredient_id: string
          quantity_ratio?: number | null
          reason: string
          substitute_ingredient_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          original_ingredient_id?: string
          quantity_ratio?: number | null
          reason?: string
          substitute_ingredient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_substitutions_original_ingredient_id_fkey"
            columns: ["original_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_substitutions_substitute_ingredient_id_fkey"
            columns: ["substitute_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          shelf_life_days: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          shelf_life_days?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          shelf_life_days?: number | null
        }
        Relationships: []
      }
      meal_plan_templates: {
        Row: {
          created_at: string | null
          default_constraints: Json | null
          description: string | null
          id: string
          is_premium: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          default_constraints?: Json | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          default_constraints?: Json | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string
          share_token: string | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string | null
          credit: string | null
          file_path: string
          id: string
          is_primary_thumbnail: boolean | null
          license_source: string | null
          media_type: string | null
          recipe_id: string
          step_number: number | null
        }
        Insert: {
          created_at?: string | null
          credit?: string | null
          file_path: string
          id?: string
          is_primary_thumbnail?: boolean | null
          license_source?: string | null
          media_type?: string | null
          recipe_id: string
          step_number?: number | null
        }
        Update: {
          created_at?: string | null
          credit?: string | null
          file_path?: string
          id?: string
          is_primary_thumbnail?: boolean | null
          license_source?: string | null
          media_type?: string | null
          recipe_id?: string
          step_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_items_report: {
        Row: {
          continent: string | null
          country: string | null
          detected_at: string | null
          id: string
          issue: string
          name: string
          record_type: string
        }
        Insert: {
          continent?: string | null
          country?: string | null
          detected_at?: string | null
          id?: string
          issue: string
          name: string
          record_type: string
        }
        Update: {
          continent?: string | null
          country?: string | null
          detected_at?: string | null
          id?: string
          issue?: string
          name?: string
          record_type?: string
        }
        Relationships: []
      }
      missing_recipes_report: {
        Row: {
          continent: string | null
          country: string | null
          detected_at: string | null
          id: string
          issue: string
          name: string
          record_type: string
        }
        Insert: {
          continent?: string | null
          country?: string | null
          detected_at?: string | null
          id?: string
          issue: string
          name: string
          record_type: string
        }
        Update: {
          continent?: string | null
          country?: string | null
          detected_at?: string | null
          id?: string
          issue?: string
          name?: string
          record_type?: string
        }
        Relationships: []
      }
      missing_recipes_staging: {
        Row: {
          continent: string | null
          country: string | null
          created_at: string | null
          id: string
          issue: string | null
          recipe_name: string
        }
        Insert: {
          continent?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          issue?: string | null
          recipe_name: string
        }
        Update: {
          continent?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          issue?: string | null
          recipe_name?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          preferences: Json | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          added_at: string | null
          expires_at: string | null
          id: string
          ingredient_id: string | null
          ingredient_name: string
          quantity: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          expires_at?: string | null
          id?: string
          ingredient_id?: string | null
          ingredient_name: string
          quantity?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          expires_at?: string | null
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string
          quantity?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pantry_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      personalized_recommendations: {
        Row: {
          category: string | null
          clicked: boolean | null
          expires_at: string | null
          generated_at: string | null
          id: string
          position: number | null
          recipe_id: string | null
          recommendation_reason: string | null
          recommendation_score: number
          shown_to_user: boolean | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          clicked?: boolean | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          position?: number | null
          recipe_id?: string | null
          recommendation_reason?: string | null
          recommendation_score: number
          shown_to_user?: boolean | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          clicked?: boolean | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          position?: number | null
          recipe_id?: string | null
          recommendation_reason?: string | null
          recommendation_score?: number
          shown_to_user?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personalized_recommendations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalized_recommendations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalized_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalized_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "personalized_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      planned_meals: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          meal_plan_id: string
          meal_type: string
          notes: string | null
          recipe_id: string
          servings: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          meal_plan_id: string
          meal_type: string
          notes?: string | null
          recipe_id: string
          servings?: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          meal_plan_id?: string
          meal_type?: string
          notes?: string | null
          recipe_id?: string
          servings?: number
        }
        Relationships: [
          {
            foreignKeyName: "planned_meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          cooking_time_preference: number | null
          created_at: string | null
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          full_name: string | null
          id: string
          preferred_difficulty: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          cooking_time_preference?: number | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          full_name?: string | null
          id: string
          preferred_difficulty?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          cooking_time_preference?: number | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          full_name?: string | null
          id?: string
          preferred_difficulty?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      pronunciation_guides: {
        Row: {
          audio_url: string | null
          created_at: string | null
          dish_id: string | null
          id: string
          language: string | null
          phonetic_spelling: string
          recipe_id: string | null
          region_accent: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          dish_id?: string | null
          id?: string
          language?: string | null
          phonetic_spelling: string
          recipe_id?: string | null
          region_accent?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          dish_id?: string | null
          id?: string
          language?: string | null
          phonetic_spelling?: string
          recipe_id?: string | null
          region_accent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pronunciation_guides_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pronunciation_guides_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pronunciation_guides_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string
          quantity: string | null
          recipe_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id: string
          quantity?: string | null
          recipe_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string
          quantity?: string | null
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_reviews: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          recipe_id: string
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          recipe_id: string
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          recipe_id?: string
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_similarity_scores: {
        Row: {
          calculated_at: string | null
          id: string
          recipe_a_id: string | null
          recipe_b_id: string | null
          similarity_factors: Json | null
          similarity_score: number
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          recipe_a_id?: string | null
          recipe_b_id?: string | null
          similarity_factors?: Json | null
          similarity_score: number
        }
        Update: {
          calculated_at?: string | null
          id?: string
          recipe_a_id?: string | null
          recipe_b_id?: string | null
          similarity_factors?: Json | null
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_similarity_scores_recipe_a_id_fkey"
            columns: ["recipe_a_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_similarity_scores_recipe_a_id_fkey"
            columns: ["recipe_a_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_similarity_scores_recipe_b_id_fkey"
            columns: ["recipe_b_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_similarity_scores_recipe_b_id_fkey"
            columns: ["recipe_b_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_translations: {
        Row: {
          created_at: string | null
          cultural_notes: string | null
          id: string
          ingredients: Json | null
          language_code: string
          name: string
          recipe_id: string
          steps: Json | null
          summary: string | null
          translated_by: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          cultural_notes?: string | null
          id?: string
          ingredients?: Json | null
          language_code: string
          name: string
          recipe_id: string
          steps?: Json | null
          summary?: string | null
          translated_by?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          cultural_notes?: string | null
          id?: string
          ingredients?: Json | null
          language_code?: string
          name?: string
          recipe_id?: string
          steps?: Json | null
          summary?: string | null
          translated_by?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_translations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_translations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_translations_translated_by_fkey"
            columns: ["translated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_translations_translated_by_fkey"
            columns: ["translated_by"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "recipe_translations_translated_by_fkey"
            columns: ["translated_by"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergen_tags: string[] | null
          brief_description: string | null
          calories: number | null
          carbon_footprint_score: number | null
          carbs: number | null
          category: string | null
          continent: string | null
          cook_time: number | null
          cook_time_minutes: number | null
          country: string
          created_at: string | null
          created_by: string | null
          cuisine_type: string | null
          cultural_heritage_status: string | null
          dietary_tags: string[] | null
          difficulty: string | null
          dish_id: string | null
          fats: number | null
          global_rank_taste_atlas: number | null
          heat_level: number | null
          heat_profile: string | null
          history: string | null
          history_sources: Json
          id: string
          image_url: string | null
          ingredients: Json
          is_african: boolean | null
          is_verified_authentic: boolean | null
          item_type: string | null
          name: string
          occasion_tags: string[] | null
          prep_time: number | null
          prep_time_minutes: number | null
          protein: number | null
          region_id: string | null
          safety_notes: string | null
          servings: number | null
          slug: string
          steps: Json | null
          summary: string | null
          tags: string[] | null
          umami_level: number | null
          updated_at: string | null
          variant_type:
            | Database["public"]["Enums"]["recipe_variant_type"]
            | null
          verification_status: string | null
          world_equivalent_dish: string | null
        }
        Insert: {
          allergen_tags?: string[] | null
          brief_description?: string | null
          calories?: number | null
          carbon_footprint_score?: number | null
          carbs?: number | null
          category?: string | null
          continent?: string | null
          cook_time?: number | null
          cook_time_minutes?: number | null
          country: string
          created_at?: string | null
          created_by?: string | null
          cuisine_type?: string | null
          cultural_heritage_status?: string | null
          dietary_tags?: string[] | null
          difficulty?: string | null
          dish_id?: string | null
          fats?: number | null
          global_rank_taste_atlas?: number | null
          heat_level?: number | null
          heat_profile?: string | null
          history?: string | null
          history_sources?: Json
          id?: string
          image_url?: string | null
          ingredients: Json
          is_african?: boolean | null
          is_verified_authentic?: boolean | null
          item_type?: string | null
          name: string
          occasion_tags?: string[] | null
          prep_time?: number | null
          prep_time_minutes?: number | null
          protein?: number | null
          region_id?: string | null
          safety_notes?: string | null
          servings?: number | null
          slug: string
          steps?: Json | null
          summary?: string | null
          tags?: string[] | null
          umami_level?: number | null
          updated_at?: string | null
          variant_type?:
            | Database["public"]["Enums"]["recipe_variant_type"]
            | null
          verification_status?: string | null
          world_equivalent_dish?: string | null
        }
        Update: {
          allergen_tags?: string[] | null
          brief_description?: string | null
          calories?: number | null
          carbon_footprint_score?: number | null
          carbs?: number | null
          category?: string | null
          continent?: string | null
          cook_time?: number | null
          cook_time_minutes?: number | null
          country?: string
          created_at?: string | null
          created_by?: string | null
          cuisine_type?: string | null
          cultural_heritage_status?: string | null
          dietary_tags?: string[] | null
          difficulty?: string | null
          dish_id?: string | null
          fats?: number | null
          global_rank_taste_atlas?: number | null
          heat_level?: number | null
          heat_profile?: string | null
          history?: string | null
          history_sources?: Json
          id?: string
          image_url?: string | null
          ingredients?: Json
          is_african?: boolean | null
          is_verified_authentic?: boolean | null
          item_type?: string | null
          name?: string
          occasion_tags?: string[] | null
          prep_time?: number | null
          prep_time_minutes?: number | null
          protein?: number | null
          region_id?: string | null
          safety_notes?: string | null
          servings?: number | null
          slug?: string
          steps?: Json | null
          summary?: string | null
          tags?: string[] | null
          umami_level?: number | null
          updated_at?: string | null
          variant_type?:
            | Database["public"]["Enums"]["recipe_variant_type"]
            | null
          verification_status?: string | null
          world_equivalent_dish?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "recipes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_slug: string
          item_type: string
          label: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_slug: string
          item_type: string
          label?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_slug?: string
          item_type?: string
          label?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          added_at: string | null
          affiliate_link: string | null
          affiliate_supplier_id: string | null
          checked: boolean | null
          id: string
          ingredient_id: string | null
          ingredient_name: string
          is_pantry_missing: boolean | null
          recipe_id: string | null
          store_suggestion: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          affiliate_link?: string | null
          affiliate_supplier_id?: string | null
          checked?: boolean | null
          id?: string
          ingredient_id?: string | null
          ingredient_name: string
          is_pantry_missing?: boolean | null
          recipe_id?: string | null
          store_suggestion?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          affiliate_link?: string | null
          affiliate_supplier_id?: string | null
          checked?: boolean | null
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string
          is_pantry_missing?: boolean | null
          recipe_id?: string | null
          store_suggestion?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_affiliate_supplier_id_fkey"
            columns: ["affiliate_supplier_id"]
            isOneToOne: false
            referencedRelation: "affiliate_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shopping_list_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trends: {
        Row: {
          id: string
          last_updated: string | null
          recipe_id: string | null
          score: number
          shares: number | null
          source: string | null
          views_24h: number | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          recipe_id?: string | null
          score?: number
          shares?: number | null
          source?: string | null
          views_24h?: number | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          recipe_id?: string | null
          score?: number
          shares?: number | null
          source?: string | null
          views_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trends_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trends_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string | null
          id: string
          recipe_data: Json
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_data: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_data?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploads_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploads_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "uploads_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          badge_awarded: boolean | null
          completed: boolean | null
          completed_at: string | null
          event_id: string | null
          id: string
          region_completed: Json | null
          user_id: string | null
        }
        Insert: {
          badge_awarded?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          event_id?: string | null
          id?: string
          region_completed?: Json | null
          user_id?: string | null
        }
        Update: {
          badge_awarded?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          event_id?: string | null
          id?: string
          region_completed?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_passport_stamps: {
        Row: {
          dish_id: string
          earned_at: string | null
          id: string
          region_id: string | null
          user_id: string
        }
        Insert: {
          dish_id: string
          earned_at?: string | null
          id?: string
          region_id?: string | null
          user_id: string
        }
        Update: {
          dish_id?: string
          earned_at?: string | null
          id?: string
          region_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passport_dish_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "passport_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_recipe_interactions: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          interaction_type: string
          metadata: Json | null
          recipe_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          recipe_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          recipe_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recipe_interactions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recipe_interactions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recipe_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recipe_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_recipe_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_taste_profiles: {
        Row: {
          avoided_ingredients: Json | null
          confidence_score: number | null
          cooking_skill_level: number | null
          id: string
          last_updated: string | null
          preferred_cuisines: Json | null
          preferred_ingredients: Json | null
          spice_tolerance: string | null
          time_availability_weekday: number | null
          time_availability_weekend: number | null
          training_data_points: number | null
          user_id: string | null
        }
        Insert: {
          avoided_ingredients?: Json | null
          confidence_score?: number | null
          cooking_skill_level?: number | null
          id?: string
          last_updated?: string | null
          preferred_cuisines?: Json | null
          preferred_ingredients?: Json | null
          spice_tolerance?: string | null
          time_availability_weekday?: number | null
          time_availability_weekend?: number | null
          training_data_points?: number | null
          user_id?: string | null
        }
        Update: {
          avoided_ingredients?: Json | null
          confidence_score?: number | null
          cooking_skill_level?: number | null
          id?: string
          last_updated?: string | null
          preferred_cuisines?: Json | null
          preferred_ingredients?: Json | null
          spice_tolerance?: string | null
          time_availability_weekday?: number | null
          time_availability_weekend?: number | null
          training_data_points?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_taste_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_taste_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "view_leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_taste_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "view_leaderboard_regional"
            referencedColumns: ["user_id"]
          },
        ]
      }
      venue_offerings: {
        Row: {
          dish_id: string | null
          id: string
          ingredient_id: string | null
          is_signature_item: boolean | null
          last_verified_at: string | null
          price_range: string | null
          venue_id: string
        }
        Insert: {
          dish_id?: string | null
          id?: string
          ingredient_id?: string | null
          is_signature_item?: boolean | null
          last_verified_at?: string | null
          price_range?: string | null
          venue_id: string
        }
        Update: {
          dish_id?: string | null
          id?: string
          ingredient_id?: string | null
          is_signature_item?: boolean | null
          last_verified_at?: string | null
          price_range?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_offerings_dish_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_offerings_ingredient_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_offerings_venue_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          google_place_id: string | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          type: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          google_place_id?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          type?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          google_place_id?: string | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      discover_africa: {
        Row: {
          cook_time: number | null
          country: string | null
          created_at: string | null
          difficulty: string | null
          id: string | null
          image_url: string | null
          ingredients: Json | null
          name: string | null
          prep_time: number | null
          region: string | null
          servings: number | null
          slug: string | null
          steps: Json | null
          summary: string | null
          tags: string[] | null
        }
        Relationships: []
      }
      recipe_ratings_summary: {
        Row: {
          average_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          one_star_count: number | null
          recipe_id: string | null
          three_star_count: number | null
          total_reviews: number | null
          two_star_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "discover_africa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      view_leaderboard_global: {
        Row: {
          avatar_url: string | null
          dishes_explored: number | null
          explorer_title: string | null
          full_name: string | null
          global_rank: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      view_leaderboard_regional: {
        Row: {
          region_name: string | null
          regional_dishes_count: number | null
          regional_rank: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_household_pantry: {
        Args: { p_owner_id: string }
        Returns: boolean
      }
      create_household: {
        Args: { p_name: string }
        Returns: string
      }
      generate_household_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_household_member: {
        Args: { p_household_id: string }
        Returns: boolean
      }
      is_household_owner: {
        Args: { p_household_id: string }
        Returns: boolean
      }
      join_household_by_code: {
        Args: { p_code: string }
        Returns: string
      }
      leave_household: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      regenerate_household_invite_code: {
        Args: { p_household_id: string }
        Returns: string
      }
      shares_household_with: {
        Args: { p_other_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      recipe_variant_type:
        | "Traditional_Village"
        | "Modern_City"
        | "Diaspora_Quick"
        | "Fusion"
        | "Health_Conscious"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      recipe_variant_type: [
        "Traditional_Village",
        "Modern_City",
        "Diaspora_Quick",
        "Fusion",
        "Health_Conscious",
      ],
    },
  },
} as const
