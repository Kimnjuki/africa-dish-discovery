import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, FileUp, UserRound, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { readErrorMessage } from "@/lib/errors";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchMyCreatorProfile,
  slugifyCreatorName,
  upsertCreatorProfile,
  type CreatorProfile,
} from "@/lib/creatorProfile";

type UploadRow = {
  id: string;
  status: string | null;
  rejection_reason: string | null;
  editor_notes?: string | null;
  review_region?: string | null;
  version?: number;
  created_at: string;
  recipe_data: {
    name?: string;
    country?: string;
    region?: string;
  } | null;
};

export default function CreatorStudio() {
  const { user, loading } = useRequireAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [form, setForm] = useState({
    display_name: "",
    slug: "",
    bio: "",
    country_name: "",
    country_code: "",
    languages: "",
    attribution_preference: "",
    website: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  });

  const setTab = (next: string) => {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    setParams(p, { replace: true });
  };

  const load = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const mine = await fetchMyCreatorProfile(user.id);
      setProfile(mine);
      if (mine) {
        const social = mine.social_links || {};
        setForm({
          display_name: mine.display_name,
          slug: mine.slug,
          bio: mine.bio || "",
          country_name: mine.country_name || "",
          country_code: mine.country_code || "",
          languages: (mine.languages || []).join(", "),
          attribution_preference: mine.attribution_preference || "",
          website: social.website || "",
          instagram: social.instagram || "",
          youtube: social.youtube || "",
          tiktok: social.tiktok || "",
        });
      } else {
        const name =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "cook";
        setForm((f) => ({
          ...f,
          display_name: name,
          slug: slugifyCreatorName(name),
        }));
      }

      const { data } = await supabase
        .from("uploads")
        .select("id,status,rejection_reason,editor_notes,review_region,version,created_at,recipe_data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setUploads((data || []) as UploadRow[]);
    } catch (err: unknown) {
      toast({ title: "Could not load studio", description: readErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) void load();
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const saved = await upsertCreatorProfile(
        user.id,
        {
          display_name: form.display_name,
          slug: form.slug,
          bio: form.bio,
          country_name: form.country_name,
          country_code: form.country_code,
          languages: form.languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          attribution_preference: form.attribution_preference,
          social_links: {
            website: form.website,
            instagram: form.instagram,
            youtube: form.youtube,
            tiktok: form.tiktok,
          },
        },
        profile?.id
      );
      setProfile(saved);
      toast({ title: "Creator profile saved" });
      setTab("overview");
    } catch (err: unknown) {
      toast({ title: "Save failed", description: readErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading || (user && busy && !profile && uploads.length === 0 && tab === "overview")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageMeta title="Creator Studio | LadhaQuest" description="Share African recipes." noIndex />
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold">Creator Studio</h1>
          <p className="text-muted-foreground">Sign in to submit recipes and manage your cook profile.</p>
          <Button asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const pending = uploads.filter((u) => u.status === "pending" || u.status === "in_review" || u.status === "needs_revision").length;

  return (
    <div className="min-h-screen flex flex-col">
      <PageMeta
        title="Creator Studio | LadhaQuest"
        description="Onboard as a LadhaQuest creator, submit recipes, and track editorial review."
        noIndex
      />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Creator Studio</h1>
          <p className="text-muted-foreground">
            Attribution-first submissions. Recipes are published only after regional editorial review.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions {pending > 0 && <Badge className="ml-1" variant="secondary">{pending}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submit a recipe</CardTitle>
                  <CardDescription>Guided wizard with ingredient graph matching.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/submit-recipe")}>
                    <Upload className="mr-2 h-4 w-4" /> Open wizard
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import</CardTitle>
                  <CardDescription>URL, photo, or family voice note → review queue.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => navigate("/import-recipe")}>
                    <FileUp className="mr-2 h-4 w-4" /> Import recipe
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserRound className="h-5 w-5" /> Your public profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile ? (
                  <>
                    <p className="font-medium">{profile.display_name}</p>
                    <p className="text-sm text-muted-foreground">{profile.bio || "No bio yet."}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link to={`/creators/${profile.slug}`}>
                          View public page <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setTab("profile")}>
                        Edit profile
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Create a creator profile so approved recipes credit you with Person schema.
                    </p>
                    <Button onClick={() => setTab("profile")}>Set up profile</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <form onSubmit={saveProfile} className="space-y-4 rounded-lg border p-4 md:p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Display name *</Label>
                  <Input
                    value={form.display_name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        display_name: e.target.value,
                        slug: f.slug || slugifyCreatorName(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Public slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Country *</Label>
                  <Input
                    value={form.country_name}
                    onChange={(e) => setForm((f) => ({ ...f, country_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Country code</Label>
                  <Input
                    value={form.country_code}
                    onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value.toUpperCase() }))}
                    placeholder="KE"
                  />
                </div>
              </div>
              <div>
                <Label>Languages (comma-separated)</Label>
                <Input
                  value={form.languages}
                  onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
                  placeholder="English, Swahili, Yoruba"
                />
              </div>
              <div>
                <Label>Default attribution line</Label>
                <Input
                  value={form.attribution_preference}
                  onChange={(e) => setForm((f) => ({ ...f, attribution_preference: e.target.value }))}
                  placeholder="Cooked & shared by…"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {(["website", "instagram", "youtube", "tiktok"] as const).map((key) => (
                  <div key={key}>
                    <Label className="capitalize">{key}</Label>
                    <Input
                      type="url"
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder="https://"
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save profile
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="submissions" className="mt-4 space-y-3">
            {uploads.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No submissions yet.</p>
            ) : (
              uploads.map((u) => {
                const r = u.recipe_data || {};
                const canRevise = u.status === "needs_revision" || u.status === "rejected" || u.status === "pending";
                return (
                  <Card key={u.id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{r.name || "Untitled"}</CardTitle>
                          <CardDescription>
                            {[r.country, r.region].filter(Boolean).join(" · ")} ·{" "}
                            {new Date(u.created_at).toLocaleDateString()}
                            {u.version && u.version > 1 ? ` · v${u.version}` : ""}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            u.status === "approved"
                              ? "default"
                              : u.status === "rejected" || u.status === "needs_revision"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {u.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {(u.editor_notes || u.rejection_reason) && (
                        <p className="rounded-md bg-muted p-3">
                          <span className="font-medium">Editor: </span>
                          {u.editor_notes || u.rejection_reason}
                        </p>
                      )}
                      {canRevise && u.status !== "approved" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/submit-recipe?revise=${u.id}`}>Revise & resubmit</Link>
                        </Button>
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
