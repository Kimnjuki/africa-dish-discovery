import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2, Upload as UploadIcon, ImagePlus } from "lucide-react";
import { readErrorMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(20).max(1000),
  ingredients: z.string().trim().min(10).max(4000),
  steps: z.string().trim().min(20).max(8000),
  prep_time: z.coerce.number().int().min(0).max(1440),
  cook_time: z.coerce.number().int().min(0).max(1440),
  servings: z.coerce.number().int().min(1).max(50),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cultural_notes: z.string().trim().max(2000).optional(),
});

export default function SubmitRecipe() {
  const { user, loading } = useRequireAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", country: "", summary: "", ingredients: "", steps: "",
    prep_time: "30", cook_time: "30", servings: "4",
    difficulty: "medium" as "easy" | "medium" | "hard", cultural_notes: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please check your inputs", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let image_url: string | undefined;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("recipe-uploads")
          .upload(path, imageFile, { contentType: imageFile.type });
        if (upErr) throw upErr;
        image_url = supabase.storage.from("recipe-uploads").getPublicUrl(path).data.publicUrl;
      }

      const recipe_data = {
        ...parsed.data,
        ingredients: parsed.data.ingredients.split("\n").map((l) => l.trim()).filter(Boolean),
        steps: parsed.data.steps.split("\n").map((l) => l.trim()).filter(Boolean),
        image_url,
        slug: parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      };

      const { error } = await supabase.from("uploads").insert({
        user_id: user.id,
        recipe_data,
        status: "pending",
      });
      if (error) throw error;

      toast({ title: "Submitted for review!", description: "Our editors will review your recipe shortly." });
      setForm({ name: "", country: "", summary: "", ingredients: "", steps: "", prep_time: "30", cook_time: "30", servings: "4", difficulty: "medium", cultural_notes: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err: unknown) {
      toast({ title: "Submission failed", description: readErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to submit a recipe</h1>
          <p className="text-muted-foreground">Share your family heritage with the world.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Share Your Recipe</h1>
          <p className="text-muted-foreground">
            Submit your authentic dish. Our editorial team reviews each entry for cultural accuracy before publishing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Recipe name *</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="country">Country of origin *</Label>
              <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Summary *</Label>
            <Textarea id="summary" value={form.summary} onChange={(e) => update("summary", e.target.value)} rows={3} required />
          </div>

          <div>
            <Label htmlFor="ingredients">Ingredients * (one per line)</Label>
            <Textarea id="ingredients" value={form.ingredients} onChange={(e) => update("ingredients", e.target.value)} rows={6} placeholder="2 cups rice&#10;1 tsp salt" required />
          </div>

          <div>
            <Label htmlFor="steps">Instructions * (one step per line)</Label>
            <Textarea id="steps" value={form.steps} onChange={(e) => update("steps", e.target.value)} rows={8} required />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="prep_time">Prep (min) *</Label>
              <Input id="prep_time" type="number" min="0" value={form.prep_time} onChange={(e) => update("prep_time", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cook_time">Cook (min) *</Label>
              <Input id="cook_time" type="number" min="0" value={form.cook_time} onChange={(e) => update("cook_time", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="servings">Servings *</Label>
              <Input id="servings" type="number" min="1" value={form.servings} onChange={(e) => update("servings", e.target.value)} />
            </div>
            <div>
              <Label>Difficulty *</Label>
              <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cultural_notes">Cultural significance (optional but encouraged)</Label>
            <Textarea id="cultural_notes" value={form.cultural_notes} onChange={(e) => update("cultural_notes", e.target.value)} rows={4} placeholder="When is this dish traditionally served? What does it mean to your community?" />
          </div>

          <div>
            <Label>Photo (optional, max 5MB)</Label>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <ImagePlus className="h-4 w-4" />
                <span>{imageFile ? "Change photo" : "Upload photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={onImage} />
              </label>
              {imagePreview && <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded" />}
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><UploadIcon className="mr-2 h-4 w-4" /> Submit for Editorial Review</>}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
