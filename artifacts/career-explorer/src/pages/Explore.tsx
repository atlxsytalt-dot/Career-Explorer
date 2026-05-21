import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Compass, Rocket } from "lucide-react";
import { useListCareers } from "@workspace/api-client-react";
import { useApp } from "@/context/AppContext";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { t } = useApp();

  const { data: careers, isLoading } = useListCareers({ category: selectedCategory || undefined });

  const categories: { key: string; label: string }[] = [
    { key: "All", label: t("catAll") },
    { key: "Business", label: t("catBusiness") },
    { key: "Construction/Trade", label: t("catConstruction") },
    { key: "Emergency/Safety", label: t("catEmergency") },
    { key: "Tech", label: t("catTech") },
    { key: "Medical", label: t("catMedical") },
    { key: "Creative", label: t("catCreative") },
    { key: "Sports", label: t("catSports") },
    { key: "Education", label: t("catEducation") },
    { key: "Science", label: t("catScience") },
    { key: "Aviation", label: t("catAviation") },
  ];

  const filteredCareers = careers?.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-primary/30 neon-border"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--secondary) / 0.06) 100%)" }}
        >
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none rounded-3xl" />
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
          <h1 className="font-display text-4xl sm:text-5xl font-black mb-4 relative z-10 text-foreground">
            <span className="neon-text-primary">{t("exploreCareers")}</span>
          </h1>
          <p className="text-xl opacity-80 max-w-2xl font-medium relative z-10 text-muted-foreground">
            {t("exploreSubtitle")}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-14 ps-12 rounded-2xl text-lg border-2 border-border focus-visible:border-primary/60 bg-card"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:max-w-lg">
            {categories.map(cat => (
              <Button
                key={cat.key}
                variant={selectedCategory === cat.key || (cat.key === "All" && !selectedCategory) ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.key === "All" ? null : cat.key)}
                className="rounded-xl whitespace-nowrap border-2 font-bold"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-card rounded-3xl animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers?.map(career => (
              <Card
                key={career.id}
                className="rounded-3xl border border-border bg-card hover:border-primary/60 transition-all hover:neon-border hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden group"
                onClick={() => setLocation(`/career/${career.id}`)}
              >
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/15">
                    {career.icon}
                  </div>
                  <div className="inline-block px-3 py-1 bg-secondary/15 text-secondary font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
                    {career.category}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">{career.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 font-medium">
                    {career.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Compass className="w-4 h-4" /> {career.stepCount} {t("steps")}
                    </span>
                    <Button size="sm" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground font-bold">
                      {t("viewDetails")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCareers?.length === 0 && (
              <div className="col-span-full py-12 text-center flex flex-col items-center">
                <Rocket className="w-16 h-16 text-muted mb-4" />
                <h3 className="font-display font-bold text-xl mb-2">{t("noCareersFound")}</h3>
                <p className="text-muted-foreground">{t("noCareersHint")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
