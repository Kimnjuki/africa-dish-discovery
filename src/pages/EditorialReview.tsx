import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Loader2, ShieldAlert } from "lucide-react";
import { asIngredientList, asStepList, type IngredientValue, type StepValue } from "@/types/content";
import type { Json } from "@/integrations/supabase/types";
import { readErrorMessage } from "@/lib/errors";

interface SubmittedRecipe {
  name?: string;
  country?: string;
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
}

interface UploadRow {
  id: string;
  user_id: string | null;
  status: string | null;
  recipe_data: SubmittedRecipe | null;
  rejection_reason: string | null;
  created_at: string;
}

export default function EditorialReview() {
  const { user, loading: authLoading } = useRequireAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
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
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setUploads((data || []) as UploadRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab]);

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

      const { error: insErr } = await supabase.from("recipes").insert({
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
        history: r.cultural_notes,
        created_by: u.user_id,
      });
      if (insErr) throw insErr;

      const { error: updErr } = await supabase
        .from("uploads")
        .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
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

  const reject = async (u: UploadRow) => {
    const reason = rejectReasons[u.id]?.trim();
    if (!reason) {
      toast({ title: "Add a reason", description: "Please explain why this is being rejected.", variant: "destructive" });
      return;
    }
    setBusyId(u.id);
    const { error } = await supabase
      .from("uploads")
      .update({ status: "rejected", rejection_reason: reason, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", u.id);
    setBusyId(null);
    if (error) return toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    toast({ title: "Rejected" });
    load();
  };

  if (authLoading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
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
        <p className="text-muted-foreground mb-6">Review and publish community recipe submissions.</p>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : uploads.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No {tab} submissions.</p>
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
                          <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{r.country}</Badge>
                            <Badge variant="outline">{r.difficulty}</Badge>
                            <span>{new Date(u.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {r.image_url && <img src={r.image_url} alt={r.name} className="h-24 w-24 object-cover rounded" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{r.summary}</p>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">Ingredients ({ingredients.length})</summary>
                        <ul className="mt-2 list-disc list-inside text-muted-foreground">
                          {ingredients.map((i, idx) => (
                            <li key={idx}>{typeof i === "string" ? i : `${i.quantity || ""} ${i.unit || ""} ${i.name || ""}`.trim()}</li>
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

                      {u.status === "rejected" && u.rejection_reason && (
                        <div className="text-sm text-destructive">
                          <strong>Rejected:</strong> {u.rejection_reason}
                        </div>
                      )}

                      {tab === "pending" && (
                        <div className="space-y-2 pt-2">
                          <Textarea
                            placeholder="Reason for rejection (required to reject)"
                            value={rejectReasons[u.id] || ""}
                            onChange={(e) => setRejectReasons((p) => ({ ...p, [u.id]: e.target.value }))}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => approve(u)} disabled={busyId === u.id} className="flex-1">
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve & Publish
                            </Button>
                            <Button onClick={() => reject(u)} disabled={busyId === u.id} variant="destructive" className="flex-1">
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
