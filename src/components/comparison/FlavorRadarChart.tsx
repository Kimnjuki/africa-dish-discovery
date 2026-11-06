import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";

interface FlavorProfile {
  smoky: number;
  umami: number;
  fermented: number;
  citrus: number;
  spicy: number;
  earthy: number;
}

interface FlavorRadarChartProps {
  dish1: {
    name: string;
    flavors: FlavorProfile;
  };
  dish2: {
    name: string;
    flavors: FlavorProfile;
  };
}

export const FlavorRadarChart = ({ dish1, dish2 }: FlavorRadarChartProps) => {
  const data = [
    { flavor: "Smoky", dish1: dish1.flavors.smoky, dish2: dish2.flavors.smoky },
    { flavor: "Umami", dish1: dish1.flavors.umami, dish2: dish2.flavors.umami },
    { flavor: "Fermented", dish1: dish1.flavors.fermented, dish2: dish2.flavors.fermented },
    { flavor: "Citrus", dish1: dish1.flavors.citrus, dish2: dish2.flavors.citrus },
    { flavor: "Spicy", dish1: dish1.flavors.spicy, dish2: dish2.flavors.spicy },
    { flavor: "Earthy", dish1: dish1.flavors.earthy, dish2: dish2.flavors.earthy },
  ];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="hsl(var(--muted-foreground) / 0.3)" />
          <PolarAngleAxis 
            dataKey="flavor" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name={dish1.name}
            dataKey="dish1"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Radar
            name={dish2.name}
            dataKey="dish2"
            stroke="hsl(25, 95%, 53%)"
            fill="hsl(25, 95%, 53%)"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
