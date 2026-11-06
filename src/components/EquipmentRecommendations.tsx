import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, ShoppingBag } from "lucide-react";

interface Equipment {
  name: string;
  description: string;
  priceRange: string;
  rating: number;
  affiliateUrl: string;
  image?: string;
  essential: boolean;
}

const defaultEquipment: Equipment[] = [
  {
    name: "Dutch Oven (5.5 Qt)",
    description: "Essential for stews, soups, and one-pot African dishes like Jollof Rice",
    priceRange: "$45-$80",
    rating: 4.8,
    affiliateUrl: "#",
    essential: true,
  },
  {
    name: "Mortar & Pestle",
    description: "Traditional tool for grinding spices and making pastes — authentic flavor",
    priceRange: "$15-$35",
    rating: 4.6,
    affiliateUrl: "#",
    essential: true,
  },
  {
    name: "Cast Iron Skillet (12\")",
    description: "Perfect for suya, grilled meats, and flatbreads",
    priceRange: "$25-$50",
    rating: 4.9,
    affiliateUrl: "#",
    essential: false,
  },
  {
    name: "Spice Grinder",
    description: "Electric grinder for berbere, suya spice, and ras el hanout blends",
    priceRange: "$20-$40",
    rating: 4.5,
    affiliateUrl: "#",
    essential: false,
  },
];

interface EquipmentRecommendationsProps {
  recipeName?: string;
  equipment?: Equipment[];
}

export const EquipmentRecommendations = ({ recipeName, equipment = defaultEquipment }: EquipmentRecommendationsProps) => {
  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Recommended Equipment
          </CardTitle>
          <Badge variant="secondary" className="text-xs">Sponsored</Badge>
        </div>
        {recipeName && (
          <p className="text-sm text-muted-foreground">
            Essential tools for making {recipeName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {equipment.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm">{item.name}</span>
                {item.essential && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Essential</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{item.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.priceRange}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 gap-1 text-xs">
              <ExternalLink className="w-3 h-3" />
              Shop
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
