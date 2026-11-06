import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { displayName } from "@/types/content";

interface RecipeUpload {
  name: string;
  country: string;
  summary?: string;
  ingredients: Array<{ name: string; quantity: string; unit: string }>;
  steps: Array<{ instruction: string }>;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  slug: string;
  is_african?: boolean;
  image_url?: string;
}

export default function RecipeUploader() {
  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; success: boolean; error?: string }>>([]);
  const { toast } = useToast();

  const validateRecipe = (recipe: unknown): recipe is RecipeUpload => {
    const required = ["name", "country", "ingredients", "steps", "prep_time", "cook_time", "servings", "difficulty", "slug"];
    return required.every(field => recipe[field] !== undefined);
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setResults([]);
      
      const recipes: RecipeUpload[] = JSON.parse(jsonInput);
      
      if (!Array.isArray(recipes)) {
        toast({
          title: "Invalid format",
          description: "JSON must be an array of recipes",
          variant: "destructive",
        });
        return;
      }

      const uploadResults: Array<{ name: string; success: boolean; error?: string }> = [];

      for (const recipe of recipes) {
        if (!validateRecipe(recipe)) {
          uploadResults.push({
            name: displayName(recipe) || "Unknown",
            success: false,
            error: "Missing required fields",
          });
          continue;
        }

        const { error } = await supabase.from("recipes").insert({
          name: recipe.name,
          country: recipe.country,
          summary: recipe.summary,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          tags: recipe.tags,
          slug: recipe.slug,
          is_african: recipe.is_african || false,
          image_url: recipe.image_url,
        });

        uploadResults.push({
          name: recipe.name,
          success: !error,
          error: error?.message,
        });
      }

      setResults(uploadResults);
      
      const successCount = uploadResults.filter(r => r.success).length;
      const failCount = uploadResults.filter(r => !r.success).length;
      
      toast({
        title: "Upload complete",
        description: `${successCount} recipes uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
      });

      if (successCount > 0) {
        setJsonInput("");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/recipe-upload-template.json";
    link.download = "recipe-upload-template.json";
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recipe Bulk Upload</h1>
            <p className="text-muted-foreground">
              Upload multiple recipes at once using JSON format. Download the template to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!jsonInput.trim() || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Recipes
                    </>
                  )}
                </Button>
              </div>

              <Textarea
                placeholder="Paste your JSON array of recipes here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
              />

              <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                <h3 className="font-semibold">Required Fields:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>name, country, slug</li>
                  <li>ingredients (array of objects with name, quantity, unit)</li>
                  <li>steps (array of objects with instruction)</li>
                  <li>prep_time, cook_time, servings</li>
                  <li>difficulty (easy/medium/hard)</li>
                  <li>tags (array of strings)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Upload Results</h2>
              
              {results.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  Upload results will appear here
                </div>
              ) : (
                <div className="border rounded-lg divide-y max-h-[600px] overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 flex items-start gap-3 ${
                        result.success ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.name}</p>
                        {result.error && (
                          <p className="text-sm text-muted-foreground mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {results.filter(r => r.success).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {results.filter(r => !r.success).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
