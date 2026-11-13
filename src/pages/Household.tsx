import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Home,
  Loader2,
  LogOut,
  Package,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  createHousehold,
  fetchMyHousehold,
  fetchSharedHouseholdPantry,
  joinHouseholdByCode,
  leaveHousehold,
  memberDisplayName,
  regenerateInviteCode,
  removeMember,
  setSharePantry,
  type Household,
  type HouseholdMember,
  type HouseholdRole,
  type SharedPantryItem,
} from "@/lib/household";

const HouseholdPage = () => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [myRole, setMyRole] = useState<HouseholdRole | null>(null);
  const [sharedPantry, setSharedPantry] = useState<SharedPantryItem[]>([]);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setHousehold(null);
      setMembers([]);
      setMyRole(null);
      setSharedPantry([]);
      setLoading(false);
      return;
    }

    try {
      const result = await fetchMyHousehold();
      setHousehold(result.household);
      setMembers(result.members);
      setMyRole(result.myRole);

      if (result.household?.share_pantry && result.members.length > 0) {
        const items = await fetchSharedHouseholdPantry(uid, result.members);
        setSharedPantry(items);
      } else {
        setSharedPantry([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load household");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onCreate = async () => {
    if (!createName.trim()) {
      toast.error("Enter a household name");
      return;
    }
    setBusy(true);
    try {
      await createHousehold(createName.trim());
      setCreateName("");
      toast.success("Household created");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not create household";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async () => {
    if (!joinCode.trim()) {
      toast.error("Enter an invite code");
      return;
    }
    setBusy(true);
    try {
      await joinHouseholdByCode(joinCode.trim());
      setJoinCode("");
      toast.success("Joined household");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not join household";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const onLeave = async () => {
    if (!confirm("Leave this household?")) return;
    setBusy(true);
    try {
      await leaveHousehold();
      toast.success("Left household");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not leave";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const onToggleShare = async (checked: boolean) => {
    if (!household || myRole !== "owner") return;
    setBusy(true);
    try {
      await setSharePantry(household.id, checked);
      toast.success(checked ? "Pantry sharing on" : "Pantry sharing off");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const onCopyCode = async () => {
    if (!household?.invite_code) return;
    try {
      await navigator.clipboard.writeText(household.invite_code);
      toast.success("Invite code copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const onRegenCode = async () => {
    if (!household || myRole !== "owner") return;
    setBusy(true);
    try {
      const code = await regenerateInviteCode(household.id);
      setHousehold({ ...household, invite_code: code });
      toast.success("New invite code generated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not regenerate";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (member: HouseholdMember) => {
    if (!confirm(`Remove ${memberDisplayName(member)}?`)) return;
    setBusy(true);
    try {
      await removeMember(member.id);
      toast.success("Member removed");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not remove";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Household sharing | LadhaQuest"
        description="Create or join a household to share pantry ingredients with family members."
        canonical="https://www.ladhaquest.com/household"
      />
      <Navigation />
      <main className="pt-24 pb-16 container mx-auto px-6 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Home className="w-8 h-8 text-primary" />
            Household
          </h1>
          <p className="text-muted-foreground mt-2">
            Share one pantry with family. Invite with a code — email invites come later.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading…
          </div>
        ) : !userId ? (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <p>Sign in to create or join a household.</p>
              <Button asChild variant="hero">
                <Link to="/auth">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        ) : !household ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create household</CardTitle>
                <CardDescription>You become the owner and get an invite code.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hh-name">Name</Label>
                  <Input
                    id="hh-name"
                    placeholder="e.g. Okonkwo kitchen"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <Button onClick={onCreate} disabled={busy} className="w-full">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join with code</CardTitle>
                <CardDescription>Ask a household owner for their invite code.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hh-code">Invite code</Label>
                  <Input
                    id="hh-code"
                    placeholder="ABCD1234"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={12}
                    className="font-mono tracking-wider"
                  />
                </div>
                <Button onClick={onJoin} disabled={busy} variant="secondary" className="w-full">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Join
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{household.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Your role:{" "}
                      <Badge variant="secondary" className="ml-1">
                        {myRole}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLeave} disabled={busy}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Invite code</Label>
                  <div className="flex flex-wrap gap-2">
                    <code className="px-3 py-2 rounded-md bg-muted font-mono text-lg tracking-widest">
                      {household.invite_code}
                    </code>
                    <Button type="button" variant="secondary" size="sm" onClick={onCopyCode}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    {myRole === "owner" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRegenCode}
                        disabled={busy}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New code
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this code in chat or person-to-person. Email invites are not wired yet.
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Share pantry with household
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Members can see each other&apos;s pantry items (read-only).
                    </p>
                  </div>
                  <Switch
                    checked={household.share_pantry}
                    onCheckedChange={onToggleShare}
                    disabled={busy || myRole !== "owner"}
                    aria-label="Share pantry with household"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {memberDisplayName(m)}
                          {m.user_id === userId ? (
                            <span className="text-muted-foreground font-normal"> (you)</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                      </div>
                      {myRole === "owner" && m.user_id !== userId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove ${memberDisplayName(m)}`}
                          onClick={() => onRemove(m)}
                          disabled={busy}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Shared pantry
                </CardTitle>
                <CardDescription>
                  Ingredients from other members
                  {household.share_pantry ? "" : " (sharing is off)"}. Your own items stay on{" "}
                  <Link to="/pantry" className="text-primary underline-offset-2 hover:underline">
                    Pantry
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!household.share_pantry ? (
                  <p className="text-sm text-muted-foreground">
                    Owner has turned off pantry sharing.
                  </p>
                ) : sharedPantry.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No shared items yet — ask members to add ingredients to their pantry.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {sharedPantry.map((item) => (
                      <li key={item.id} className="py-2 flex justify-between gap-3 text-sm">
                        <span>
                          <span className="font-medium">{item.ingredient_name}</span>
                          {(item.quantity || item.unit) && (
                            <span className="text-muted-foreground">
                              {" "}
                              · {[item.quantity, item.unit].filter(Boolean).join(" ")}
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {item.owner_name || "Member"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HouseholdPage;
