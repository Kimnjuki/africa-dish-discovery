import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUp,
  Link2,
  Loader2,
  Mic,
  ImagePlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { readErrorMessage } from "@/lib/errors";
import {
  MARKET_ORDER,
  MARKETS,
  getMarketPreference,
  type MarketId,
} from "@/lib/localMarket";
import {
  adaptDraftForMarket,
  draftFromJsonLd,
  draftFromPlainText,
  draftToFormFields,
  extractJsonLdRecipes,
  type ImportedRecipeDraft,
} from "@/lib/recipeImport";
import { saveToFolder } from "@/lib/recipeBox";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export default function ImportRecipe() {
  const { user, loading } = useRequireAuth();
  const navigate = useNavigate();
  const [marketId, setMarketId] = useState<MarketId>(() => getMarketPreference());
  const [url, setUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState<ImportedRecipeDraft | null>(null);
  const [attribution, setAttribution] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const adaptationCount = draft?.local_adaptations.length || 0;

  const applyDraft = (next: ImportedRecipeDraft) => {
    const adapted = adaptDraftForMarket(next, marketId);
    if (attribution.trim()) {
      adapted.source_attribution = attribution.trim();
    }
    setDraft(adapted);
    toast.success("Draft ready — review before submitting");
  };

  const importUrl = async () => {
    if (!url.trim()) {
      toast.error("Paste a recipe URL");
      return;
    }
    setBusy(true);
    try {
      // Try client-side fetch first (works when CORS allows)
      let html = "";
      try {
        const res = await fetch(url.trim());
        if (res.ok) html = await res.text();
      } catch {
        /* fall through to edge */
      }

      if (html) {
        const recipes = extractJsonLdRecipes(html);
        if (recipes.length) {
          applyDraft(
            draftFromJsonLd(recipes[0], { sourceUrl: url.trim(), marketId })
          );
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("import-recipe", {
        body: { mode: "url", url: url.trim(), market_hint: MARKETS[marketId].label },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data?.recipe || {};
      applyDraft({
        name: String(r.name || "Imported recipe"),
        country: String(r.country || "Africa"),
        summary: String(r.summary || ""),
        ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(String) : [],
        steps: Array.isArray(r.steps) ? r.steps.map(String) : [],
        prep_time: Number(r.prep_time) || 20,
        cook_time: Number(r.cook_time) || 30,
        servings: Number(r.servings) || 4,
        difficulty: (r.difficulty as ImportedRecipeDraft["difficulty"]) || "medium",
        cultural_notes: String(r.cultural_notes || ""),
        source_url: String(r.source_url || url.trim()),
        source_attribution: String(r.source_attribution || `Imported from ${url.trim()}`),
        import_method: "url",
        local_adaptations: [],
      });
    } catch (err: unknown) {
      toast.error(readErrorMessage(err) || "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const importPaste = async (method: ImportedRecipeDraft["import_method"] = "paste") => {
    if (paste.trim().length < 20) {
      toast.error("Paste more of the recipe or transcript");
      return;
    }
    setBusy(true);
    try {
      // Prefer local heuristic; AI enrich if thin
      let next = draftFromPlainText(paste, {
        method,
        marketId,
        source: attribution || undefined,
      });
      if (next.ingredients.length < 2 || next.steps.length < 2) {
        const { data, error } = await supabase.functions.invoke("import-recipe", {
          body: {
            mode: "text",
            text: paste,
            market_hint: MARKETS[marketId].label,
          },
        });
        if (!error && data?.recipe) {
          const r = data.recipe;
          next = {
            name: String(r.name || next.name),
            country: String(r.country || next.country),
            summary: String(r.summary || next.summary),
            ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(String) : next.ingredients,
            steps: Array.isArray(r.steps) ? r.steps.map(String) : next.steps,
            prep_time: Number(r.prep_time) || next.prep_time,
            cook_time: Number(r.cook_time) || next.cook_time,
            servings: Number(r.servings) || next.servings,
            difficulty: (r.difficulty as ImportedRecipeDraft["difficulty"]) || "medium",
            cultural_notes: String(r.cultural_notes || ""),
            source_attribution:
              attribution || String(r.source_attribution || "Family / oral tradition"),
            import_method: method,
            local_adaptations: [],
          };
        }
      }
      applyDraft(next);
    } catch (err: unknown) {
      toast.error(readErrorMessage(err) || "Could not parse paste");
    } finally {
      setBusy(false);
    }
  };

  const importPhoto = async (file: File) => {
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke("import-recipe", {
        body: {
          mode: "image",
          image_base64: base64,
          mime_type: file.type || "image/jpeg",
          market_hint: MARKETS[marketId].label,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data?.recipe || {};
      applyDraft({
        name: String(r.name || "Photo recipe"),
        country: String(r.country || "Africa"),
        summary: String(r.summary || "Extracted from photo — please verify."),
        ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(String) : [],
        steps: Array.isArray(r.steps) ? r.steps.map(String) : [],
        prep_time: Number(r.prep_time) || 20,
        cook_time: Number(r.cook_time) || 30,
        servings: Number(r.servings) || 4,
        difficulty: (r.difficulty as ImportedRecipeDraft["difficulty"]) || "medium",
        cultural_notes: String(r.cultural_notes || ""),
        source_attribution:
          attribution || String(r.source_attribution || "Photographed family recipe"),
        import_method: "photo",
        local_adaptations: [],
      });
    } catch (err: unknown) {
      toast.error(readErrorMessage(err) || "Photo import failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleVoice = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input is not supported in this browser — paste a transcript instead");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-KE";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (ev) => {
      const parts: string[] = [];
      for (let i = 0; i < ev.results.length; i++) {
        parts.push(ev.results[i][0]?.transcript || "");
      }
      setPaste(parts.join(" ").trim());
    };
    recognition.onerror = (ev) => {
      toast.error(ev.error || "Voice recognition error");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    toast.message("Listening — describe the recipe, then stop and extract");
  };

  const sendToReview = async () => {
    if (!user || !draft) return;
    if (!draft.source_attribution.trim()) {
      toast.error("Source attribution is required");
      return;
    }
    setBusy(true);
    try {
      const fields = draftToFormFields(draft);
      const recipe_data = {
        ...fields,
        ingredients: draft.ingredients,
        steps: draft.steps,
        slug: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        import_method: draft.import_method,
        source_url: draft.source_url,
        source_attribution: draft.source_attribution,
        local_adaptations: draft.local_adaptations,
        market_id: marketId,
        needs_human_review: true,
      };
      const { data, error } = await supabase
        .from("uploads")
        .insert({
          user_id: user.id,
          recipe_data,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;

      saveToFolder({
        recipeId: data.id,
        slug: `pending-${data.id}`,
        name: `${draft.name} (pending review)`,
        country: draft.country,
        folderId: "favorites",
      });

      toast.success("Submitted for human review with attribution preserved");
      navigate("/submit-recipe");
    } catch (err: unknown) {
      toast.error(readErrorMessage(err) || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const previewFields = useMemo(
    () => (draft ? draftToFormFields(draft) : null),
    [draft]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold">Sign in to import recipes</h1>
          <p className="text-muted-foreground">
            Bring family voice notes, photos, and web recipes into your African kitchen library.
          </p>
          <Button asChild variant="hero">
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
        title="Import a recipe | LadhaQuest"
        description="Import recipes from URLs, photos, voice notes, and family notes — then adapt ingredients for your local market."
        noIndex
      />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Import a recipe</h1>
          <p className="text-muted-foreground max-w-2xl">
            African family recipes often live as WhatsApp notes, photos, and oral instructions.
            Import them here, keep attribution, and adapt ingredients for your market. AI drafts
            always need your review before publishing.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2 flex-1">
            <Label>Local market (for substitutions)</Label>
            <Select value={marketId} onValueChange={(v) => setMarketId(v as MarketId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKET_ORDER.map((id) => (
                  <SelectItem key={id} value={id}>
                    {MARKETS[id].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-[2]">
            <Label htmlFor="attribution">Source attribution *</Label>
            <Input
              id="attribution"
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="e.g. Mama Amina, Lagos · WhatsApp voice note 2024"
            />
          </div>
        </div>

        <Tabs defaultValue="url">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="url">
              <Link2 className="mr-1.5 h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="photo">
              <ImagePlus className="mr-1.5 h-4 w-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="mr-1.5 h-4 w-4" />
              Voice / paste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Import from a web page</CardTitle>
                <CardDescription>
                  Free for everyone — unlike NYT, import is not locked behind a subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                />
                <Button type="button" onClick={importUrl} disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Extract recipe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Import from a photo</CardTitle>
                <CardDescription>
                  Handwritten cards, notebook pages, or screenshots — AI extracts, you verify.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void importPhoto(f);
                  }}
                />
                <Button type="button" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Choose photo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice note or family text</CardTitle>
                <CardDescription>
                  Record in-browser or paste a WhatsApp transcript / handwritten transcription.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  rows={10}
                  placeholder={"Egusi Soup\nIngredients\n…\nSteps\n…"}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={toggleVoice} disabled={busy}>
                    <Mic className="mr-2 h-4 w-4" />
                    {listening ? "Stop listening" : "Start voice capture"}
                  </Button>
                  <Button type="button" onClick={() => importPaste(listening ? "voice" : "paste")} disabled={busy}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Extract & adapt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {draft && previewFields && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                Review draft
                <Badge variant="secondary">Human review required</Badge>
                {adaptationCount > 0 && (
                  <Badge variant="outline">{adaptationCount} local swaps suggested</Badge>
                )}
              </CardTitle>
              <CardDescription>{draft.source_attribution}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-1">{previewFields.name}</p>
                  <p className="text-muted-foreground">{previewFields.country}</p>
                  <p className="mt-2">{previewFields.summary}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Ingredients</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {draft.ingredients.slice(0, 12).map((ing) => (
                      <li key={ing}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {draft.local_adaptations.length > 0 && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-sm font-medium">Local adaptations for {MARKETS[marketId].label}</p>
                  {draft.local_adaptations.map((a) => (
                    <p key={a.original} className="text-sm text-muted-foreground">
                      <span className="text-foreground">{a.original}</span>
                      {" → "}
                      <span className="text-foreground">{a.suggestion}</span>
                      {" — "}
                      {a.reason}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="hero" disabled={busy} onClick={sendToReview}>
                  Submit for editorial review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/submit-recipe">Open manual submit form</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
