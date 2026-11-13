import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  History, 
  Users, 
  ChefHat, 
  Sparkles,
  Volume2,
  Play,
  Eye
} from "lucide-react";
import { SourceCitations } from "./SourceCitations";
import { useDataSaver } from "@/hooks/useDataSaver";
import { DataSaverImage } from "@/components/DataSaverImage";

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

interface CulturalStoryCardProps {
  story: CulturalStory;
  onPlay?: () => void;
}

const storyTypeConfig = {
  origin: { icon: History, label: "Origin Story", color: "bg-amber-500/10 text-amber-600" },
  tradition: { icon: Users, label: "Tradition", color: "bg-blue-500/10 text-blue-600" },
  personal: { icon: BookOpen, label: "Personal Story", color: "bg-green-500/10 text-green-600" },
  historical: { icon: History, label: "Historical", color: "bg-purple-500/10 text-purple-600" },
  chef_insight: { icon: ChefHat, label: "Chef's Insight", color: "bg-orange-500/10 text-orange-600" },
};

export function CulturalStoryCard({ story, onPlay }: CulturalStoryCardProps) {
  const config = storyTypeConfig[story.story_type];
  const Icon = config.icon;
  const { dataSaver } = useDataSaver();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {story.images && story.images.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <DataSaverImage
            src={story.images[0]}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          {story.video_url && !dataSaver && (
            <Button 
              size="icon" 
              variant="secondary"
              className="absolute inset-0 m-auto w-12 h-12 rounded-full"
              onClick={onPlay}
            >
              <Play className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          {story.is_verified && (
            <Badge variant="outline" className="text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg mt-2">{story.title}</h3>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {story.content}
        </p>
        
        <SourceCitations sources={story.sources} className="pt-2 border-t" />

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {story.author_name && (
              <span>By {story.author_name}</span>
            )}
            {story.author_role && (
              <Badge variant="outline" className="text-xs">
                {story.author_role}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {story.audio_url && (
              <Button size="sm" variant="ghost" className="h-8 px-2">
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {story.view_count}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
