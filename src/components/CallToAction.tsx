import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Star, ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-6">
        {/* Cook the Continent Challenge */}
        <div className="text-center mb-16 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-full px-4 py-2 mb-6">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Limited Challenge</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Cook the Continent</span>
            <br />
            <span className="text-foreground">Challenge</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Try one recipe from each of Africa's 5 regions and earn your digital badge. 
            Join thousands of food explorers on this culinary adventure.
          </p>
        </div>

        {/* Challenge Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Users,
              title: "Join fellow explorers",
              description: "Connect with fellow food adventurers sharing their cooking journeys",
              color: "text-primary"
            },
            {
              icon: Trophy,
              title: "Earn Digital Badges",
              description: "Showcase your achievements and unlock new recipe collections",
              color: "text-accent"
            },
            {
              icon: Star,
              title: "Featured Profile",
              description: "Complete the challenge and get featured on our community page",
              color: "text-primary"
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className="border-primary/20 shadow-soft hover:shadow-warm transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Challenge Progress */}
        <Card className="border-primary/20 shadow-warm bg-card/50 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Your Challenge Progress</h3>
                <div className="space-y-4">
                  {[
                    { region: "West Africa", completed: false, recipe: "Try Jollof Rice" },
                    { region: "East Africa", completed: false, recipe: "Try Doro Wat" },
                    { region: "North Africa", completed: false, recipe: "Try Tagine" },
                    { region: "Central Africa", completed: false, recipe: "Try Moambe" },
                    { region: "Southern Africa", completed: false, recipe: "Try Bobotie" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        item.completed ? 'bg-accent border-accent' : 'border-muted-foreground'
                      }`} />
                      <span className={`text-sm ${
                        item.completed ? 'text-accent font-medium' : 'text-muted-foreground'
                      }`}>
                        {item.region}: {item.recipe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">0/5</div>
                <div className="text-muted-foreground mb-6">Regions Completed</div>
                <Button variant="hero" size="lg" className="w-full">
                  Start Challenge
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Signup */}
        <Card className="border-primary/20 shadow-warm bg-gradient-primary">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Never Miss a Recipe
            </h3>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Get weekly African recipes, cooking tips, and cultural stories delivered to your inbox. 
              Plus, be the first to know about new challenges and features.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                />
              </div>
              <Button variant="secondary" size="lg" className="px-8">
                Subscribe
              </Button>
            </div>
            
            <p className="text-xs text-primary-foreground/70 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CallToAction;