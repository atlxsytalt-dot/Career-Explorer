import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Compass, Rocket, Flame } from "lucide-react";
import { useListCareers } from "@workspace/api-client-react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, delay: i * 0.05, type: "spring", stiffness: 220, damping: 22 },
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { t } = useApp();

  const { data: careers, isLoading } = useListCareers({ category: selectedCategory || undefined });

  const categories: { key: string; label: string; emoji: string }[] = [
    { key: "All", label: t("catAll"), emoji: "🌐" },
    { key: "Business", label: t("catBusiness"), emoji: "💼" },
    { key: "Construction/Trade", label: t("catConstruction"), emoji: "🏗️" },
    { key: "Emergency/Safety", label: t("catEmergency"), emoji: "🚨" },
    { key: "Tech", label: t("catTech"), emoji: "💻" },
    { key: "Medical", label: t("catMedical"), emoji: "🏥" },
    { key: "Creative", label: t("catCreative"), emoji: "🎨" },
    { key: "Sports", label: t("catSports"), emoji: "⚽" },
    { key: "Education", label: t("catEducation"), emoji: "📚" },
    { key: "Science", label: t("catScience"), emoji: "🔬" },
    { key: "Aviation", label: t("catAviation"), emoji: "✈️" },
  ];

  const filteredCareers = careers?.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageTransition>
        <div className="flex flex-col gap-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-primary/30 neon-border"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--secondary) / 0.06) 100%)" }}
          >
            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none rounded-3xl" />
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-black mb-3 text-foreground">
                  <span className="neon-text-primary">{t("exploreCareers")}</span>
                </h1>
                <p className="text-xl opacity-80 max-w-2xl font-medium text-muted-foreground">
                  {t("exploreSubtitle")}
                </p>
              </div>
              {careers && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="ms-auto hidden sm:flex items-center gap-2 bg-accent/10 border border-accent/30 px-4 py-2 rounded-2xl"
                >
                  <Flame className="w-5 h-5 text-accent" />
                  <span className="font-black text-accent">{careers.length}</span>
                  <span className="font-bold text-muted-foreground text-sm">careers</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-14 ps-12 rounded-2xl text-lg border-2 border-border focus-visible:border-primary/60 bg-card"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => (
                <motion.div key={cat.key} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={selectedCategory === cat.key || (cat.key === "All" && !selectedCategory) ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.key === "All" ? null : cat.key)}
                    className="rounded-xl whitespace-nowrap border-2 font-bold gap-1.5"
                  >
                    <span>{cat.emoji}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-card rounded-3xl animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCareers?.map((career, i) => (
                  <motion.div
                    key={career.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <Card
                      className="rounded-3xl border border-border bg-card hover:border-primary/60 transition-all cursor-pointer overflow-hidden group h-full"
                      onClick={() => setLocation(`/career/${career.id}`)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="h-full"
                      >
                        <CardContent className="p-6 flex flex-col h-full">
                          <motion.div
                            className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-primary/15 transition-colors"
                            whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.4 }}
                          >
                            {career.icon}
                          </motion.div>
                          <div className="inline-block px-3 py-1 bg-secondary/15 text-secondary font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
                            {career.category}
                          </div>
                          <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">{career.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 font-medium flex-1">
                            {career.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              <Compass className="w-4 h-4" /> {career.stepCount} {t("steps")}
                            </span>
                            <Button size="sm" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground font-bold transition-all">
                              {t("viewDetails")} →
                            </Button>
                          </div>
                        </CardContent>
                      </motion.div>
                    </Card>
                  </motion.div>
                ))}
                {filteredCareers?.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-12 text-center flex flex-col items-center"
                  >
                    <Rocket className="w-16 h-16 text-muted mb-4" />
                    <h3 className="font-display font-bold text-xl mb-2">{t("noCareersFound")}</h3>
                    <p className="text-muted-foreground">{t("noCareersHint")}</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
