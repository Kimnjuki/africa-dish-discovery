import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Loader2, ShieldAlert, RotateCcw } from "lucide-react";
import { asIngredientList, asStepList } from "@/types/content";
import type { Json } from "@/integrations/supabase/types";
import { readErrorMessage } from "@/lib/errors";

interface SubmittedRecipe {
  name?: string;
  country?: string;
  region?: string;
  slug?: string;
  summary?: string;
  ingredients?: unknown;
  steps?: unknown;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  image_url?: string;
  cultural_notes?: string;
  source_attribution?: string;
  diet_tags?: string[];
  allergens?: string[];
}

interface UploadRow {
  id: string;
  user_id: string | null;
  status: string | null;
  recipe_data: SubmittedRecipe | null;
  rejection_reason: string | null;
  editor_notes?: string | null;
  review_region?: string | null;
  version?: number;
  created_at: string;
}

const TABS = ["pending", "in_review", "needs_revision", "approved", "rejected"] as const;

export default function EditorialReview() {
  const { user, loading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [editorNotes, setEditorNotes] = useState<Record<string, string>>({});
  const [regionFilter, setRegionFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const roles = (data || []).map((r) => r.role);
      setIsAdmin(roles.includes("admin") || roles.includes("moderator"));
    })();
  }, [user]);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("uploads")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (regionFilter.trim()) {
      q = q.ilike("review_region", `%${regionFilter.trim()}%`);
    }
    const { data, error } = await q;
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setUploads((data || []) as UploadRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab, regionFilter]);

  const approve = async (u: UploadRow) => {
    setBusyId(u.id);
    try {
      const r = u.recipe_data || {};
      const ingredients = asIngredientList(r.ingredients).map((i) =>
        typeof i === "string" ? { name: i, quantity: "", unit: "" } : i
      );
      const steps = asStepList(r.steps).map((s) =>
        typeof s === "string" ? { instruction: s } : s
      );

      const historyBits = [
        r.cultural_notes,
        r.source_attribution ? `Attribution: ${r.source_attribution}` : null,
        r.region ? `Region: ${r.region}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: inserted, error: insErr } = await supabase
        .from("recipes")
        .insert({
          name: r.name || "Untitled",
          country: r.country || "Unknown",
          slug: `${r.slug || r.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
          summary: r.summary,
          ingredients: ingredients as Json,
          steps: steps as Json,
          prep_time: r.prep_time,
          cook_time: r.cook_time,
          servings: r.servings,
          difficulty: r.difficulty,
          image_url: r.image_url,
          history: historyBits || null,
          dietary_tags: r.diet_tags || null,
          allergen_tags: r.allergens || null,
          created_by: u.user_id,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      const { error: updErr } = await supabase
        .from("uploads")
        .update({
          status: "approved",
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
          published_recipe_id: inserted.id,
          editor_notes: editorNotes[u.id] || null,
        } as never)
        .eq("id", u.id);
      if (updErr) throw updErr;

      toast({ title: "Approved & published" });
      load();
    } catch (err: unknown) {
      toast({ title: "Approval failed", description: readErrorMessage(err), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const requestRevision = async (u: UploadRow) => {
    const notes = (editorNotes[u.id] || rejectReasons[u.id] || "").trim();
    if (!notes) {
      toast({
        title: "Add editor notes",
        description: "Explain what the cook should fix.",
        variant: "destructive",
      });
      return;
    }
    setBusyId(u.id);
    const { error } = await supabase
      .from("uploads")
      .update({
        status: "needs_revision",
        editor_notes: notes,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq("id", u.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Sent back for revision" });
    load();
  };

  const markInReview = async (u: UploadRow) => {
    setBusyId(u.id);
    const { error } = await supabase
      .from("uploads")
      .update({
        status: "in_review",
        regional_reviewer_id: user!.id,
        reviewed_by: user!.id,
      } as never)
      .eq("id", u.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Marked in regional review" });
    load();
  };

  const reject = async (u: UploadRow) => {
    const reason = rejectReasons[u.id]?.trim();
    if (!reason) {
      toast({ title: "Add a reason", description: "Please explain why this is being rejected.", variant: "destructive" });
      return;
    }
    setBusyId(u.id);
    const { error } = await supabase
      .from("uploads")
      .update({
        status: "rejected",
        rejection_reason: reason,
        editor_notes: editorNotes[u.id] || reason,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq("id", u.id);
    setBusyId(null);
    if (error) return toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    toast({ title: "Rejected" });
    load();
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-2">Editorial access required</h1>
          <p className="text-muted-foreground">This dashboard is for editors and moderators only.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">Editorial Review</h1>
        <p className="text-muted-foreground mb-6">
          Regional review → revise loop → publish. Community cooks never write directly to the recipe catalog.
        </p>

        <div className="mb-4 max-w-sm">
          <Label htmlFor="regionFilter">Filter by region</Label>
          <Input
            id="regionFilter"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            placeholder="e.g. Yoruba, Coastal"
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t.replace("_", " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="mt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : uploads.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No {tab.replace("_", " ")} submissions.</p>
            ) : (
              uploads.map((u) => {
                const r = u.recipe_data || {};
                const ingredients = asIngredientList(r.ingredients);
                const steps = asStepList(r.steps);
                return (
                  <Card key={u.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{r.name || "Untitled"}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{r.country}</Badge>
                            {(r.region || u.review_region) && (
                              <Badge variant="outline">{r.region || u.review_region}</Badge>
                            )}
                            <Badge variant="outline">{r.difficulty}</Badge>
                            {u.version && u.version > 1 && <Badge variant="secondary">v{u.version}</Badge>}
                            <span>{new Date(u.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {r.image_url && (
                          <img src={r.image_url} alt={r.name} className="h-24 w-24 object-cover rounded" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{r.summary}</p>
                      {r.source_attribution && (
                        <p className="text-sm">
                          <strong>Attribution:</strong> {r.source_attribution}
                        </p>
                      )}
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">
                          Ingredients ({ingredients.length})
                        </summary>
                        <ul className="mt-2 list-disc list-inside text-muted-foreground">
                          {ingredients.map((i, idx) => (
                            <li key={idx}>
                              {typeof i === "string"
                                ? i
                                : `${i.quantity || ""} ${i.unit || ""} ${i.name || ""}`.trim()}
                            </li>
                          ))}
                        </ul>
                      </details>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">Steps ({steps.length})</summary>
                        <ol className="mt-2 list-decimal list-inside text-muted-foreground space-y-1">
                          {steps.map((s, idx) => (
                            <li key={idx}>{typeof s === "string" ? s : s.instruction}</li>
                          ))}
                        </ol>
                      </details>
                      {r.cultural_notes && (
                        <div className="text-sm bg-muted p-3 rounded">
                          <strong>Cultural notes:</strong> {r.cultural_notes}
                        </div>
                      )}
                      {(r.allergens?.length || 0) > 0 && (
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          Allergen hints: {r.allergens?.join(", ")}
                        </p>
                      )}

                      {(tab === "pending" || tab === "in_review" || tab === "needs_revision") && (
                        <div className="space-y-2 pt-2">
                          <Textarea
                            placeholder="Editor notes / revision feedback"
                            value={editorNotes[u.id] || ""}
                            onChange={(e) => setEditorNotes((p) => ({ ...p, [u.id]: e.target.value }))}
                            rows={2}
                          />
                          <Textarea
                            placeholder="Rejection reason (required to reject)"
                            value={rejectReasons[u.id] || ""}
                            onChange={(e) => setRejectReasons((p) => ({ ...p, [u.id]: e.target.value }))}
                            rows={2}
                          />
                          <div className="flex flex-wrap gap-2">
                            {tab === "pending" && (
                              <Button
                                onClick={() => markInReview(u)}
                                disabled={busyId === u.id}
                                variant="secondary"
                              >
                                Claim regional review
                              </Button>
                            )}
                            <Button onClick={() => approve(u)} disabled={busyId === u.id} className="flex-1 min-w-[10rem]">
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve & Publish
                            </Button>
                            <Button
                              onClick={() => requestRevision(u)}
                              disabled={busyId === u.id}
                              variant="outline"
                              className="flex-1 min-w-[10rem]"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" /> Needs revision
                            </Button>
                            <Button
                              onClick={() => reject(u)}
                              disabled={busyId === u.id}
                              variant="destructive"
                              className="flex-1 min-w-[10rem]"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
