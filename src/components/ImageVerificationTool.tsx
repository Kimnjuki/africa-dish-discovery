import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Flag,
  ImageIcon,
  Loader2
} from 'lucide-react';
import { getCountryFlag, getContinent } from '@/utils/countryFlags';
import RecipeImagePlaceholder from '@/components/RecipeImagePlaceholder';

interface Recipe {
  id: string;
  name: string;
  country: string;
  continent: string | null;
  image_url: string | null;
  summary: string | null;
}

interface VerificationResult {
  recipeId: string;
  recipeName: string;
  status: 'verified' | 'flagged' | 'skipped';
  notes: string;
  timestamp: Date;
}

// Expected food characteristics by dish type
const dishCharacteristics: Record<string, string[]> = {
  // African dishes
  'jollof': ['rice', 'red/orange color', 'tomato-based', 'one-pot'],
  'fufu': ['white/cream color', 'dough-like', 'starchy', 'smooth'],
  'injera': ['flatbread', 'spongy', 'gray/beige', 'round'],
  'tagine': ['stew', 'clay pot', 'moroccan spices', 'meat/vegetables'],
  'couscous': ['small grains', 'fluffy', 'yellow/white', 'steamed'],
  'suya': ['grilled meat', 'skewers', 'spicy', 'Nigerian'],
  'bobotie': ['baked dish', 'egg topping', 'curry', 'South African'],
  'chapati': ['flatbread', 'round', 'layered', 'golden brown'],
  'nshima': ['white porridge', 'maize', 'starchy', 'African staple'],
  'sukuma': ['leafy greens', 'collard', 'sautéed', 'Kenyan'],
  
  // Asian dishes
  'pho': ['noodle soup', 'Vietnamese', 'beef/chicken', 'herbs'],
  'ramen': ['Japanese noodles', 'broth', 'egg', 'toppings'],
  'sushi': ['rice', 'fish', 'seaweed', 'Japanese'],
  'dim sum': ['dumplings', 'steamed', 'small portions', 'Chinese'],
  'curry': ['sauce-based', 'spiced', 'meat/vegetables'],
  'biryani': ['rice', 'layered', 'spiced', 'Indian'],
  'kimchi': ['fermented', 'cabbage', 'red/spicy', 'Korean'],
  'pad thai': ['noodles', 'Thai', 'peanuts', 'stir-fried'],
  
  // European dishes
  'pasta': ['Italian', 'noodles', 'sauce'],
  'pizza': ['flatbread', 'toppings', 'cheese', 'Italian'],
  'paella': ['rice', 'Spanish', 'seafood/meat', 'saffron'],
  'croissant': ['pastry', 'flaky', 'crescent', 'French'],
  'schnitzel': ['breaded', 'fried', 'meat', 'German/Austrian'],
  
  // American dishes
  'burger': ['bun', 'patty', 'American'],
  'tacos': ['tortilla', 'filling', 'Mexican'],
  'ceviche': ['raw fish', 'citrus', 'Peruvian/Latin'],
};

export const ImageVerificationTool = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [notes, setNotes] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with-image' | 'flagged'>('with-image');
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, [filterMode]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('recipes')
        .select('id, name, country, continent, image_url, summary')
        .order('name');

      if (filterMode === 'with-image') {
        query = query.not('image_url', 'is', null)
          .not('image_url', 'ilike', '%example.com%');
      }

      const { data, error } = await query;
      if (error) throw error;

      setRecipes(data || []);
      setCurrentIndex(0);
    } catch (error) {
      toast({
        title: "Error loading recipes",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentRecipe = recipes[currentIndex];

  const getExpectedCharacteristics = (dishName: string): string[] => {
    const lowerName = dishName.toLowerCase();
    for (const [key, characteristics] of Object.entries(dishCharacteristics)) {
      if (lowerName.includes(key)) {
        return characteristics;
      }
    }
    return [];
  };

  const handleVerify = (status: 'verified' | 'flagged' | 'skipped') => {
    if (!currentRecipe) return;

    const result: VerificationResult = {
      recipeId: currentRecipe.id,
      recipeName: currentRecipe.name,
      status,
      notes,
      timestamp: new Date(),
    };

    setVerificationResults(prev => [...prev, result]);
    setNotes('');

    toast({
      title: status === 'verified' ? "Image Verified ✓" : 
             status === 'flagged' ? "Image Flagged ⚠" : "Skipped",
      description: currentRecipe.name,
      variant: status === 'flagged' ? "destructive" : "default",
    });

    // Move to next
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToRecipe = (index: number) => {
    if (index >= 0 && index < recipes.length) {
      setCurrentIndex(index);
      setNotes('');
    }
  };

  // Stats
  const stats = {
    total: recipes.length,
    verified: verificationResults.filter(r => r.status === 'verified').length,
    flagged: verificationResults.filter(r => r.status === 'flagged').length,
    skipped: verificationResults.filter(r => r.status === 'skipped').length,
    remaining: recipes.length - verificationResults.length,
  };

  const progressPercent = recipes.length > 0 
    ? (verificationResults.length / recipes.length) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Image Verification Tool</h2>
        <p className="text-muted-foreground">
          Verify that dish images match their authentic cultural representation
        </p>
      </div>

      {/* Stats Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Flagged
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.remaining}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>

            {/* Filter Mode */}
            <div className="flex gap-2">
              <Button
                variant={filterMode === 'with-image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('with-image')}
              >
                <ImageIcon className="w-4 h-4 mr-1" /> With Images
              </Button>
              <Button
                variant={filterMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('all')}
              >
                All Recipes
              </Button>
            </div>
          </div>

          <Progress value={progressPercent} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1 text-center">
            {verificationResults.length} of {stats.total} reviewed ({Math.round(progressPercent)}%)
          </div>
        </CardContent>
      </Card>

      {/* Main Verification Panel */}
      {currentRecipe ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getCountryFlag(currentRecipe.country)}</span>
                  {currentRecipe.name}
                </CardTitle>
                <Badge variant="outline">
                  {currentIndex + 1} / {recipes.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                {currentRecipe.image_url && !currentRecipe.image_url.includes('example.com') ? (
                  <img
                    src={currentRecipe.image_url}
                    alt={currentRecipe.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <RecipeImagePlaceholder
                      name={currentRecipe.name}
                      country={currentRecipe.country}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>Country:</strong> {currentRecipe.country}</p>
                <p><strong>Continent:</strong> {currentRecipe.continent || getContinent(currentRecipe.country)}</p>
                {currentRecipe.summary && (
                  <p><strong>Description:</strong> {currentRecipe.summary}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Expected Characteristics */}
              <div>
                <h4 className="font-semibold mb-2">Expected Characteristics:</h4>
                <div className="flex flex-wrap gap-2">
                  {getExpectedCharacteristics(currentRecipe.name).length > 0 ? (
                    getExpectedCharacteristics(currentRecipe.name).map((char, i) => (
                      <Badge key={i} variant="secondary">{char}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No specific characteristics defined - use general assessment
                    </span>
                  )}
                </div>
              </div>

              {/* Verification Questions */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold">Does the image show:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Authentic representation of {currentRecipe.country} cuisine?
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Correct food type matching the dish name?
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Appropriate presentation style for the culture?
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    High-quality, appetizing photo?
                  </li>
                </ul>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Notes (optional):</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any observations about the image..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerify('verified')}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Verify
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleVerify('flagged')}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Flag Issue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify('skipped')}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => goToRecipe(currentIndex - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={currentIndex >= recipes.length - 1}
                  onClick={() => goToRecipe(currentIndex + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">All recipes reviewed!</h3>
            <p className="text-muted-foreground">
              You've verified all {stats.total} recipes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Flagged Items Log */}
      {verificationResults.filter(r => r.status === 'flagged').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Flagged Images ({verificationResults.filter(r => r.status === 'flagged').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {verificationResults
                  .filter(r => r.status === 'flagged')
                  .map((result, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <div>
                        <span className="font-medium">{result.recipeName}</span>
                        {result.notes && (
                          <p className="text-sm text-muted-foreground">{result.notes}</p>
                        )}
                      </div>
                      <Badge variant="destructive">Flagged</Badge>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageVerificationTool;
