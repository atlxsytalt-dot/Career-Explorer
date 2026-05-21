import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, Star, Users, Map, Trophy } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";

export default function Home() {
  const { data: stats } = useGetStats();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden relative">
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">Career Explorer</span>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="rounded-xl font-bold hidden sm:flex">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95">Start Exploring!</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground font-bold text-sm mb-8 animate-bounce-slow">
          <Star className="w-4 h-4 text-accent" />
          <span>Made for Wales School!</span>
        </div>
        
        <h1 className="font-display text-5xl sm:text-7xl font-black text-foreground max-w-4xl leading-tight tracking-tight mb-6">
          What will <span className="text-primary inline-block -rotate-2">YOU</span> become?
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl font-medium mb-12">
          Discover cool jobs, complete fun challenges, and earn badges as you figure out how to change the world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/sign-up">
            <Button size="lg" className="h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-black">
              Start Your Adventure
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 border-muted-foreground/20 font-bold hover:bg-muted">
              I already have an account
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-muted flex flex-col items-center transition-transform hover:-translate-y-1">
              <Users className="w-8 h-8 text-secondary mb-2" />
              <span className="text-3xl font-black text-foreground">{stats.totalUsers}</span>
              <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Explorers</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-muted flex flex-col items-center transition-transform hover:-translate-y-1">
              <Map className="w-8 h-8 text-primary mb-2" />
              <span className="text-3xl font-black text-foreground">{stats.totalCareers}</span>
              <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Careers</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-muted flex flex-col items-center transition-transform hover:-translate-y-1 col-span-2 md:col-span-1">
              <Trophy className="w-8 h-8 text-accent mb-2" />
              <span className="text-3xl font-black text-foreground">100+</span>
              <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Challenges</span>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-muted py-6 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            © 2024 Career Explorer. Made by Hamed for Wales School. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}