import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Compass, Rocket } from "lucide-react";
import { useListCareers } from "@workspace/api-client-react";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const { data: careers, isLoading } = useListCareers({ category: selectedCategory || undefined });

  const categories = ["All", "Business", "Construction/Trade", "Emergency/Safety", "Tech", "Medical", "Creative", "Sports", "Education", "Science", "Aviation"];

  const filteredCareers = careers?.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">
        <div className="bg-primary text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <h1 className="font-display text-4xl sm:text-5xl font-black mb-4 relative z-10">Explore Careers</h1>
          <p className="text-xl opacity-90 max-w-2xl font-medium relative z-10">
            What will YOU become? Browse through amazing jobs and start your adventure today.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search careers... (e.g. Doctor, Pilot, Game Developer)"
              className="h-14 pl-12 rounded-2xl text-lg border-2 shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:max-w-md">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat || (cat === "All" && !selectedCategory) ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
                className="rounded-xl whitespace-nowrap border-2 font-bold"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers?.map(career => (
              <Card 
                key={career.id} 
                className="rounded-3xl border-2 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden group"
                onClick={() => setLocation(`/career/${career.id}`)}
              >
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/10">
                    {career.icon}
                  </div>
                  <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
                    {career.category}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">{career.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 font-medium">
                    {career.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Compass className="w-4 h-4" /> {career.stepCount} Steps
                    </span>
                    <Button size="sm" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-white font-bold">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCareers?.length === 0 && (
              <div className="col-span-full py-12 text-center flex flex-col items-center">
                <Rocket className="w-16 h-16 text-muted mb-4" />
                <h3 className="font-display font-bold text-xl mb-2">No careers found</h3>
                <p className="text-muted-foreground">Try a different search term or category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}