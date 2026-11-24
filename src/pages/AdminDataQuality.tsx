import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, XCircle, Database, Link2, Shuffle } from "lucide-react";
import { readErrorMessage } from "@/lib/errors";
import { track, EVENTS } from "@/lib/analytics";

interface AliasRow {
  id: string;
  alias: string;
  language: string;
  country_code: string;
  match_confidence: number;
  source: string | null;
  review_status: string;
  ingredient_id: string;
  ingredients?: { name: string; slug: string | null; wikidata_qid?: string | null } | null;
}

interface Stats {
  recipes: number;
  recipeIngredients: number;
  ingredients: number;
  withQid: number;
  aliases: number;
  proposedAliases: number;
  substitutions: number;
  calories: number;
}

export default function AdminDataQuality() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [aliases, setAliases] = useState<AliasRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    const headCount = async (p: PromiseLike<{ count: number | null }>) => {
      const { count: c } = await p;
      return c || 0;
    };

    const [recipes, recipeIngredients, ingredients, withQid, aliasesCount, proposedAliases, substitutions, calories] =
      await Promise.all([
        headCount(supabase.from("recipes").select("id", { count: "exact", head: true })),
        headCount(supabase.from("recipe_ingredients").select("id", { count: "exact", head: true })),
        headCount(supabase.from("ingredients").select("id", { count: "exact", head: true })),
        headCount(
          supabase.from("ingredients").select("id", { count: "exact", head: true }).not("wikidata_qid", "is", null)
        ),
        headCount(supabase.from("ingredient_aliases").select("id", { count: "exact", head: true })),
        headCount(
          supabase
            .from("ingredient_aliases")
            .select("id", { count: "exact", head: true })
            .eq("review_status", "proposed")
        ),
        headCount(supabase.from("ingredient_substitutions").select("id", { count: "exact", head: true })),
        headCount(supabase.from("recipes").select("id", { count: "exact", head: true }).not("calories", "is", null)),
      ]);

    setStats({
      recipes,
      recipeIngredients,
      ingredients,
      withQid,
      aliases: aliasesCount,
      proposedAliases,
      substitutions,
      calories,
    });
  }, []);

  const loadProposed = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ingredient_aliases")
      .select("id,alias,language,country_code,match_confidence,source,review_status,ingredient_id,ingredients(name,slug,wikidata_qid)")
      .eq("review_status", "proposed")
      .order("match_confidence", { ascending: false })
      .limit(80);
    if (error) {
      toast({ title: "Failed to load aliases", description: error.message, variant: "destructive" });
      setAliases([]);
    } else {
      setAliases((data || []) as unknown as AliasRow[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadStats();
    void loadProposed();
  }, [loadStats, loadProposed]);

  const setStatus = async (row: AliasRow, status: "approved" | "rejected") => {
    setBusyId(row.id);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("ingredient_aliases")
        .update({
          review_status: status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: auth.user?.id || "admin",
        })
        .eq("id", row.id);
      if (error) throw error;
      track(EVENTS.ALIAS_REVIEWED, {
        aliasId: row.id,
        alias: row.alias,
        status,
        ingredient: row.ingredients?.name,
      });
      setAliases((prev) => prev.filter((a) => a.id !== row.id));
      setStats((s) =>
        s
          ? {
              ...s,
              proposedAliases: Math.max(0, s.proposedAliases - 1),
            }
          : s
      );
      toast({ title: status === "approved" ? "Alias approved" : "Alias rejected" });
    } catch (e) {
      toast({ title: "Update failed", description: readErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const completeness =
    stats && stats.recipes > 0 ? Math.round((stats.calories / stats.recipes) * 1000) / 10 : 0;
  const joinCoverage =
    stats && stats.recipes > 0
      ? Math.round((Math.min(stats.recipeIngredients / 8, stats.recipes) / stats.recipes) * 1000) / 10
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Data quality — LadhaQuest admin"
        description="Review proposed ingredient aliases, graph coverage, and recipe completeness."
        noIndex
      />
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold">Data quality</h1>
            <p className="text-muted-foreground mt-1">
              Curate Wikidata proposals and monitor the African ingredient graph.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/editorial-review">Recipe editorial</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" /> Join rows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats?.recipeIngredients ?? "—"}</p>
              <p className="text-xs text-muted-foreground">~{joinCoverage}% recipes with ~8+ mapped ingredients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Wikidata QIDs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats?.withQid ?? "—"}</p>
              <p className="text-xs text-muted-foreground">of {stats?.ingredients ?? "—"} ingredients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shuffle className="h-4 w-4" /> Substitutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats?.substitutions ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{stats?.proposedAliases ?? "—"} aliases pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nutrition field</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{completeness}%</p>
              <p className="text-xs text-muted-foreground">{stats?.calories ?? "—"} recipes with calories</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="aliases">
          <TabsList>
            <TabsTrigger value="aliases">Proposed aliases</TabsTrigger>
            <TabsTrigger value="guide">Editor guide</TabsTrigger>
          </TabsList>
          <TabsContent value="aliases" className="mt-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : aliases.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No proposed aliases in the queue.</p>
            ) : (
              aliases.map((row) => (
                <Card key={row.id}>
                  <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{row.alias}</p>
                      <p className="text-sm text-muted-foreground">
                        → {row.ingredients?.name || "Unknown"} · {row.language}
                        {row.country_code ? ` · ${row.country_code}` : ""} · conf{" "}
                        {Math.round((row.match_confidence || 0) * 100)}%
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline">{row.source || "unknown"}</Badge>
                        {row.ingredients?.wikidata_qid && (
                          <Badge variant="secondary">{row.ingredients.wikidata_qid}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() => setStatus(row, "approved")}
                      >
                        {busyId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === row.id}
                        onClick={() => setStatus(row, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => void loadProposed()}>
                Refresh queue
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="guide" className="mt-4 prose prose-sm dark:prose-invert max-w-none">
            <ul>
              <li>Approve only when the alias truly refers to the linked canonical ingredient.</li>
              <li>Reject Wikidata noise (disambiguation pages, wrong taxon, brand names).</li>
              <li>Language codes follow Wikidata (sw, ha, yo, ig, am, zu, fr, ar, pt, en).</li>
              <li>
                Re-run <code>npm run wikidata:extract</code> to propose more aliases; they stay{" "}
                <code>proposed</code> until reviewed.
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
