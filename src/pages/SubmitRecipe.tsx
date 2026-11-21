import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  Loader2,
  Upload as UploadIcon,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { readErrorMessage } from "@/lib/errors";
import { EVENTS, track } from "@/lib/analytics";
import {
  IngredientAliasPicker,
  type StructuredIngredient,
} from "@/components/creator/IngredientAliasPicker";
import { fetchMyCreatorProfile } from "@/lib/creatorProfile";

const basicsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(20).max(1000),
  difficulty: z.enum(["easy", "medium", "hard"]),
  prep_time: z.coerce.number().int().min(0).max(1440),
  cook_time: z.coerce.number().int().min(0).max(1440),
  servings: z.coerce.number().int().min(1).max(50),
});

type StepRow = { instruction: string; timer_seconds: number | null };

const STEPS = ["Basics", "Ingredients", "Method", "Story & media", "Review"] as const;

export default function SubmitRecipe() {
  const { user, loading } = useRequireAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reviseId = params.get("revise");

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parentUploadId, setParentUploadId] = useState<string | null>(null);
  const [version, setVersion] = useState(1);

  const [basics, setBasics] = useState({
    name: "",
    country: "",
    region: "",
    summary: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    prep_time: "30",
    cook_time: "30",
    servings: "4",
  });
  const [ingredients, setIngredients] = useState<StructuredIngredient[]>([]);
  const [methodSteps, setMethodSteps] = useState<StepRow[]>([{ instruction: "", timer_seconds: null }]);
  const [culturalNotes, setCulturalNotes] = useState("");
  const [sourceAttribution, setSourceAttribution] = useState("");
  const [editorFeedback, setEditorFeedback] = useState<string | null>(null);

  useEffect(() => {
    track(EVENTS.CREATOR_SUBMISSION_STARTED, { source: "submit-recipe-wizard" });
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const profile = await fetchMyCreatorProfile(user.id);
        setHasProfile(Boolean(profile));
        if (profile?.attribution_preference && !sourceAttribution) {
          setSourceAttribution(profile.attribution_preference);
        }
        if (profile?.country_name && !basics.country) {
          setBasics((b) => ({ ...b, country: profile.country_name || b.country }));
        }
      } catch {
        setHasProfile(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !reviseId) return;
    (async () => {
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", reviseId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error || !data) return;
      const r = (data.recipe_data || {}) as Record<string, unknown>;
      setParentUploadId(data.id);
      setVersion(Number((data as { version?: number }).version || 1) + 1);
      setEditorFeedback(
        (data as { editor_notes?: string | null }).editor_notes ||
          data.rejection_reason ||
          null
      );
      setBasics({
        name: String(r.name || ""),
        country: String(r.country || ""),
        region: String(r.region || ""),
        summary: String(r.summary || ""),
        difficulty: (["easy", "medium", "hard"].includes(String(r.difficulty))
          ? String(r.difficulty)
          : "medium") as "easy" | "medium" | "hard",
        prep_time: String(r.prep_time ?? 30),
        cook_time: String(r.cook_time ?? 30),
        servings: String(r.servings ?? 4),
      });
      if (Array.isArray(r.ingredients)) {
        setIngredients(
          r.ingredients.map((ing: unknown) => {
            if (typeof ing === "string") {
              return {
                display_text: ing,
                name: ing,
                quantity: "",
                unit: "",
                is_optional: false,
              };
            }
            const o = ing as StructuredIngredient;
            return {
              display_text: o.display_text || o.name,
              name: o.name,
              quantity: o.quantity || "",
              unit: o.unit || "",
              ingredient_id: o.ingredient_id,
              slug: o.slug,
              is_optional: Boolean(o.is_optional),
              allergens: o.allergens,
              dietary_tags: o.dietary_tags,
            };
          })
        );
      }
      if (Array.isArray(r.steps)) {
        setMethodSteps(
          r.steps.map((s: unknown) => {
            if (typeof s === "string") return { instruction: s, timer_seconds: null };
            const o = s as { instruction?: string; timer_seconds?: number | null };
            return {
              instruction: o.instruction || "",
              timer_seconds: o.timer_seconds ?? null,
            };
          })
        );
      }
      setCulturalNotes(String(r.cultural_notes || ""));
      setSourceAttribution(String(r.source_attribution || ""));
      if (typeof r.image_url === "string") setImagePreview(r.image_url);
    })();
  }, [user, reviseId]);

  const dietAllergenHints = useMemo(() => {
    const diets = new Set<string>();
    const allergens = new Set<string>();
    for (const ing of ingredients) {
      ing.dietary_tags?.forEach((d) => diets.add(d));
      ing.allergens?.forEach((a) => allergens.add(a));
    }
    return { diets: [...diets], allergens: [...allergens] };
  }, [ingredients]);

  const updateBasic = (k: string, v: string) => setBasics((f) => ({ ...f, [k]: v }));

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      const parsed = basicsSchema.safeParse(basics);
      if (!parsed.success) {
        toast({
          title: "Check basics",
          description: parsed.error.issues[0]?.message,
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (ingredients.length < 2) {
        toast({
          title: "Add ingredients",
          description: "Include at least two ingredients.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    if (step === 2) {
      const filled = methodSteps.filter((s) => s.instruction.trim().length >= 8);
      if (filled.length < 2) {
        toast({
          title: "Add cooking steps",
          description: "Include at least two clear steps (8+ characters each).",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!sourceAttribution.trim()) {
        toast({
          title: "Attribution required",
          description: "Credit the cook, family, or source.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateStep()) return;
    const parsed = basicsSchema.safeParse(basics);
    if (!parsed.success) return;

    setSubmitting(true);
    try {
      const slug = parsed.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data: existing } = await supabase
        .from("recipes")
        .select("slug,name")
        .eq("slug", slug)
        .limit(1);
      if (existing?.length) {
        toast({
          title: "Similar recipe may already exist",
          description: `Found “${existing[0].name}”. Editors will check for duplicates.`,
        });
      }

      let image_url: string | undefined =
        !imageFile && imagePreview && imagePreview.startsWith("http") ? imagePreview : undefined;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("recipe-uploads")
          .upload(path, imageFile, { contentType: imageFile.type });
        if (upErr) throw upErr;
        image_url = supabase.storage.from("recipe-uploads").getPublicUrl(path).data.publicUrl;
      }

      const cleanSteps = methodSteps
        .filter((s) => s.instruction.trim())
        .map((s) => ({
          instruction: s.instruction.trim(),
          timer_seconds: s.timer_seconds && s.timer_seconds > 0 ? s.timer_seconds : null,
        }));

      const recipe_data = {
        ...parsed.data,
        ingredients,
        steps: cleanSteps,
        image_url,
        slug,
        cultural_notes: culturalNotes.trim() || undefined,
        source_attribution: sourceAttribution.trim(),
        diet_tags: dietAllergenHints.diets,
        allergens: dietAllergenHints.allergens,
        submission_channel: "submit-recipe-wizard",
        version,
      };

      if (parentUploadId) {
        const { error } = await supabase
          .from("uploads")
          .update({
            recipe_data,
            status: "pending",
            version,
            rejection_reason: null,
            editor_notes: null,
            review_region: parsed.data.region,
            reviewed_at: null,
            reviewed_by: null,
          } as never)
          .eq("id", parentUploadId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("uploads").insert({
          user_id: user.id,
          recipe_data,
          status: "pending",
          version: 1,
          review_region: parsed.data.region,
        } as never);
        if (error) throw error;
      }

      track(EVENTS.CREATOR_SUBMISSION_PUBLISHED, {
        source: "submit-recipe-wizard",
        status: "pending_review",
        country: parsed.data.country,
        ingredient_count: ingredients.length,
        step_count: cleanSteps.length,
      });

      toast({
        title: "Submitted for editorial review",
        description: "Track status in Creator Studio. It will not appear publicly until approved.",
      });
      navigate("/creator-studio?tab=submissions");
    } catch (err: unknown) {
      toast({ title: "Submission failed", description: readErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageMeta title="Submit a recipe | LadhaQuest" description="Sign in to share a recipe." noIndex />
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to submit a recipe</h1>
          <Button asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageMeta
        title="Submit a recipe | LadhaQuest"
        description="Guided African recipe submission with ingredient graph matching and editorial review."
        noIndex
      />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">Recipe submission studio</h1>
            <Badge variant="secondary">Editorial review</Badge>
          </div>
          <p className="text-muted-foreground">
            Country and region are required. Ingredients resolve against the African Ingredient Graph.
            Prefer importing from a URL or photo?{" "}
            <Link to="/import-recipe" className="text-primary underline underline-offset-2">
              Import recipe
            </Link>
            .
          </p>
        </div>

        {hasProfile === false && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            Set up your creator profile so published recipes credit you correctly.{" "}
            <Link to="/creator-studio" className="text-primary underline underline-offset-2">
              Open Creator Studio
            </Link>
          </div>
        )}

        {editorFeedback && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium mb-1">Editor feedback</p>
            <p className="text-muted-foreground">{editorFeedback}</p>
          </div>
        )}

        <ol className="flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li key={label}>
              <Badge variant={i === step ? "default" : i < step ? "secondary" : "outline"}>
                {i < step && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {i + 1}. {label}
              </Badge>
            </li>
          ))}
        </ol>

        <div className="rounded-lg border p-4 md:p-6 space-y-5">
          {step === 0 && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Recipe name *</Label>
                  <Input id="name" value={basics.name} onChange={(e) => updateBasic("name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" value={basics.country} onChange={(e) => updateBasic("country", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="region">Region / community *</Label>
                <Input
                  id="region"
                  value={basics.region}
                  onChange={(e) => updateBasic("region", e.target.value)}
                  placeholder="e.g. Coastal Kenya, Yoruba, Cape Malay"
                />
              </div>
              <div>
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  value={basics.summary}
                  onChange={(e) => updateBasic("summary", e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Prep (min)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={basics.prep_time}
                    onChange={(e) => updateBasic("prep_time", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cook (min)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={basics.cook_time}
                    onChange={(e) => updateBasic("cook_time", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input
                    type="number"
                    min={1}
                    value={basics.servings}
                    onChange={(e) => updateBasic("servings", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={basics.difficulty} onValueChange={(v) => updateBasic("difficulty", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 1 && <IngredientAliasPicker value={ingredients} onChange={setIngredients} />}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                One instruction per step. Optional timer (seconds) powers cook mode.
              </p>
              {methodSteps.map((s, idx) => (
                <div key={idx} className="grid gap-2 md:grid-cols-[1fr_120px]">
                  <div>
                    <Label>Step {idx + 1}</Label>
                    <Textarea
                      rows={2}
                      value={s.instruction}
                      onChange={(e) => {
                        const next = [...methodSteps];
                        next[idx] = { ...next[idx], instruction: e.target.value };
                        setMethodSteps(next);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Timer (sec)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="optional"
                      value={s.timer_seconds ?? ""}
                      onChange={(e) => {
                        const next = [...methodSteps];
                        const n = e.target.value === "" ? null : Number(e.target.value);
                        next[idx] = { ...next[idx], timer_seconds: n };
                        setMethodSteps(next);
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setMethodSteps((rows) => [...rows, { instruction: "", timer_seconds: null }])}
              >
                Add step
              </Button>
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <Label htmlFor="cultural">Cultural context</Label>
                <Textarea
                  id="cultural"
                  rows={4}
                  value={culturalNotes}
                  onChange={(e) => setCulturalNotes(e.target.value)}
                  placeholder="When is this served? Variants? Family story?"
                />
              </div>
              <div>
                <Label htmlFor="attr">Source / attribution *</Label>
                <Input
                  id="attr"
                  value={sourceAttribution}
                  onChange={(e) => setSourceAttribution(e.target.value)}
                  placeholder="Family recipe, your name, oral history with consent…"
                />
              </div>
              <div>
                <Label>Photo (optional, max 5MB)</Label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                    <ImagePlus className="h-4 w-4" />
                    <span>{imageFile ? "Change photo" : "Upload photo"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={onImage} />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded" />
                  )}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <div>
                <h2 className="text-xl font-semibold">{basics.name || "Untitled"}</h2>
                <p className="text-muted-foreground">
                  {basics.country} · {basics.region} · {basics.difficulty}
                </p>
              </div>
              <p>{basics.summary}</p>
              <div>
                <p className="font-medium mb-1">Ingredients ({ingredients.length})</p>
                <ul className="list-disc pl-5 space-y-1">
                  {ingredients.map((i) => (
                    <li key={i.display_text}>{i.display_text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Steps ({methodSteps.filter((s) => s.instruction.trim()).length})</p>
                <ol className="list-decimal pl-5 space-y-1">
                  {methodSteps
                    .filter((s) => s.instruction.trim())
                    .map((s, i) => (
                      <li key={i}>
                        {s.instruction}
                        {s.timer_seconds ? ` (${s.timer_seconds}s)` : ""}
                      </li>
                    ))}
                </ol>
              </div>
              {dietAllergenHints.allergens.length > 0 && (
                <p>
                  <span className="font-medium">Allergen hints: </span>
                  {dietAllergenHints.allergens.join(", ")}
                </p>
              )}
              <p className="text-muted-foreground">
                Attribution: {sourceAttribution}. Submitted recipes stay private until an editor approves them.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-between">
          <Button type="button" variant="outline" onClick={back} disabled={step === 0 || submitting}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" /> Submit for review
                </>
              )}
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
