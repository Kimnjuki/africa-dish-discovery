import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CulturalStoryCard } from "./CulturalStoryCard";
import { PronunciationGuide } from "./PronunciationGuide";
import { 
  BookOpen, 
  Languages, 
  Volume2,
  MapPin,
  Sparkles
} from "lucide-react";

interface RecipeCulturalContextProps {
  recipeId: string;
  recipeName: string;
  country?: string;
}

interface CulturalStory {
  id: string;
  story_type: "origin" | "tradition" | "personal" | "historical" | "chef_insight";
  title: string;
  content: string;
  author_name?: string;
  author_role?: string;
  audio_url?: string;
  video_url?: string;
  images?: string[];
  language: string;
  is_verified: boolean;
  view_count: number;
  sources?: unknown;
}

interface PronunciationData {
  id: string;
  phonetic_spelling: string;
  audio_url?: string;
  language: string;
  region_accent?: string;
}

interface Translation {
  id: string;
  language_code: string;
  name: string;
  summary?: string;
  cultural_notes?: string;
  verified: boolean;
}

export function RecipeCulturalContext({ recipeId, recipeName, country }: RecipeCulturalContextProps) {
  const [stories, setStories] = useState<CulturalStory[]>([]);
  const [pronunciations, setPronunciations] = useState<PronunciationData[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCulturalData() {
      setIsLoading(true);
      try {
        const [storiesResult, pronunciationsResult, translationsResult] = await Promise.all([
          supabase
            .from("cultural_stories")
            .select("*")
            .eq("recipe_id", recipeId)
            .order("view_count", { ascending: false }),
          supabase
            .from("pronunciation_guides")
            .select("*")
            .eq("recipe_id", recipeId),
          supabase
            .from("recipe_translations")
            .select("*")
            .eq("recipe_id", recipeId)
        ]);

        if (storiesResult.data) {
          setStories(storiesResult.data as CulturalStory[]);
        }
        if (pronunciationsResult.data) {
          setPronunciations(pronunciationsResult.data as PronunciationData[]);
        }
        if (translationsResult.data) {
          setTranslations(translationsResult.data as Translation[]);
        }
      } catch (error) {
        console.error("Error fetching cultural data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (recipeId) {
      fetchCulturalData();
    }
  }, [recipeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasContent = stories.length > 0 || pronunciations.length > 0 || translations.length > 0;

  if (!hasContent) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold mb-2">Cultural Context Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We're working on adding cultural stories, pronunciation guides, and translations for this recipe.
          </p>
          {country && (
            <Badge variant="secondary" className="mt-4">
              <MapPin className="h-3 w-3 mr-1" />
              {country}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Cultural Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stories" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
              {stories.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {stories.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pronunciation" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Pronunciation</span>
            </TabsTrigger>
            <TabsTrigger value="translations" className="flex items-center gap-1">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Languages</span>
              {translations.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {translations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-4 space-y-4">
            {stories.length > 0 ? (
              stories.map(story => (
                <CulturalStoryCard key={story.id} story={story} />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No stories available yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pronunciation" className="mt-4 space-y-3">
            <PronunciationGuide 
              dishName={recipeName}
              phonetic={pronunciations[0]?.phonetic_spelling}
              audioUrl={pronunciations[0]?.audio_url}
              language={pronunciations[0]?.language}
              regionAccent={pronunciations[0]?.region_accent}
            />
            {pronunciations.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Regional Variations:</p>
                {pronunciations.slice(1).map(p => (
                  <PronunciationGuide 
                    key={p.id}
                    dishName={recipeName}
                    phonetic={p.phonetic_spelling}
                    audioUrl={p.audio_url}
                    language={p.language}
                    regionAccent={p.region_accent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="translations" className="mt-4 space-y-4">
            {translations.length > 0 ? (
              translations.map(translation => (
                <Card key={translation.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {translation.language_code.toUpperCase()}
                      </Badge>
                      {translation.verified && (
                        <Badge variant="secondary" className="text-primary">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold">{translation.name}</h4>
                    {translation.summary && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {translation.summary}
                      </p>
                    )}
                    {translation.cultural_notes && (
                      <p className="text-sm mt-2 p-2 bg-primary/5 rounded-md">
                        {translation.cultural_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Languages className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No translations available yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
