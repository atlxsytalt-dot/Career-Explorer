import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, User as UserIcon, Settings, LogOut, Search, Map } from "lucide-react";

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location] = useLocation();

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "002159@walesschool.com";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b-2 border-muted shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/explore" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-inner">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl hidden sm:inline-block">Career Explorer</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/explore">
            <Button variant={location === "/explore" ? "default" : "ghost"} size="sm" className="rounded-xl font-bold">
              <Map className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline-block">Explore</span>
            </Button>
          </Link>
          <Link href="/challenge">
            <Button variant={location === "/challenge" ? "default" : "ghost"} size="sm" className="rounded-xl font-bold">
              <Trophy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline-block">Challenges</span>
            </Button>
          </Link>
          
          <div className="w-px h-6 bg-muted mx-1" />

          {isAdmin && (
            <Link href="/admin">
              <Button variant={location === "/admin" ? "secondary" : "ghost"} size="sm" className="rounded-xl font-bold">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline-block">Admin</span>
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button variant={location === "/profile" ? "default" : "ghost"} size="sm" className="rounded-xl font-bold">
              <UserIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline-block">Profile</span>
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: "/" })} className="rounded-xl ml-1">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-muted mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 mb-4 opacity-50">
          <Compass className="w-5 h-5" />
          <span className="font-display font-bold">Career Explorer</span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          © 2024 Career Explorer. Made by Hamed for Wales School. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}