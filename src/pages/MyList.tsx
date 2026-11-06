import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSavedItems, type SavedItemType } from "@/hooks/useSavedItems";
import { Heart, Trash2 } from "lucide-react";

const TABS: { id: SavedItemType; label: string; path: (s: string) => string }[] = [
  { id: "dish", label: "Dishes", path: (s) => `/dish/${s}` },
  { id: "recipe", label: "Recipes", path: (s) => `/recipe/${s}` },
  { id: "country", label: "Countries", path: (s) => `/country/${s}` },
];

const MyList = () => {
  const { user, items, loading, remove } = useSavedItems();
  return (
    <div className="min-h-screen">
      <PageMeta title="My list | TasteAfrica" description="Your saved African dishes, recipes and countries." />
      <Navigation />
      <main className="pt-24 pb-16 container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6 flex items-center gap-3"><Heart className="w-8 h-8 text-primary" />My list</h1>
        {loading ? <p className="text-muted-foreground">Loading…</p> : !user ? (
          <Card><CardContent className="py-12 text-center space-y-4">
            <p>Sign in to see the dishes, recipes and countries you've saved.</p>
            <Button asChild variant="hero"><Link to="/auth">Sign in</Link></Button>
          </CardContent></Card>
        ) : (
          <Tabs defaultValue="dish">
            <TabsList className="mb-6">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>{t.label} ({items.filter((i) => i.item_type === t.id).length})</TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((t) => {
              const list = items.filter((i) => i.item_type === t.id);
              return (
                <TabsContent key={t.id} value={t.id}>
                  {list.length === 0 ? (
                    <p className="text-muted-foreground">Nothing saved yet — tap the heart on any {t.label.toLowerCase().slice(0, -1)} page.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {list.map((i) => (
                        <Card key={i.id}><CardContent className="p-4 flex items-center justify-between gap-2">
                          <Link to={t.path(i.item_slug)} className="font-medium hover:text-primary truncate">{i.label || i.item_slug}</Link>
                          <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => remove(i.id)}><Trash2 className="w-4 h-4" /></Button>
                        </CardContent></Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyList;
