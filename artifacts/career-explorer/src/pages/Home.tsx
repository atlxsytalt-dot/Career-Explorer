import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, Zap, Users, Map, Trophy } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";

export default function Home() {
  const { data: stats } = useGetStats();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background grid-bg overflow-hidden relative">
      {/* Neon glow orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-2xl flex items-center justify-center neon-border shadow-lg">
            <Compass className="w-7 h-7 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            Career <span className="text-primary">Explorer</span>
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="rounded-xl font-bold hidden sm:flex text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/30">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 active:scale-95">
              Start Exploring!
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent font-bold text-sm mb-8 neon-border-green">
          <Zap className="w-4 h-4" />
          <span>Made for Wales School!</span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-black text-foreground max-w-4xl leading-tight tracking-tight mb-6">
          What will{" "}
          <span
            className="inline-block -rotate-1"
            style={{
              color: "hsl(185 100% 50%)",
              textShadow: "0 0 20px hsl(185 100% 50% / 0.6), 0 0 60px hsl(185 100% 50% / 0.3)"
            }}
          >
            YOU
          </span>{" "}
          become?
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl font-medium mb-12">
          Discover amazing careers, complete skill challenges, and earn cool roles as you find your path to changing the world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl font-black bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all"
            >
              Start Your Adventure
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-2xl font-bold border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
            >
              I already have an account
            </Button>
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full">
            <div className="glass border border-border rounded-2xl p-6 flex flex-col items-center transition-transform hover:-translate-y-1 neon-border">
              <Users className="w-8 h-8 text-secondary mb-2" style={{ filter: "drop-shadow(0 0 8px hsl(270 100% 65% / 0.6))" }} />
              <span className="text-3xl font-black text-foreground">{stats.totalUsers}</span>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Explorers</span>
            </div>
            <div className="glass border border-border rounded-2xl p-6 flex flex-col items-center transition-transform hover:-translate-y-1 neon-border">
              <Map className="w-8 h-8 text-primary mb-2" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.6))" }} />
              <span className="text-3xl font-black text-foreground">{stats.totalCareers}</span>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Careers</span>
            </div>
            <div className="glass border border-border rounded-2xl p-6 flex flex-col items-center transition-transform hover:-translate-y-1 neon-border-green col-span-2 md:col-span-1">
              <Trophy className="w-8 h-8 text-accent mb-2" style={{ filter: "drop-shadow(0 0 8px hsl(142 100% 50% / 0.6))" }} />
              <span className="text-3xl font-black text-foreground">100+</span>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Challenges</span>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 py-6 relative z-10">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 Career Explorer · Made by Hamed for Wales School · All rights reserved
          </p>
          <Link href="/tos">
            <span className="text-xs text-primary/50 hover:text-primary transition-colors font-bold cursor-pointer underline underline-offset-2">
              Terms of Service
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
