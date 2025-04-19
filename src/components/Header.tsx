import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogOut, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface HeaderProps {
  userEmail?: string;
}

const Header = ({ userEmail: propUserEmail }: HeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(propUserEmail || "");
  
  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    
    if (!propUserEmail) {
      getUserEmail();
    }
  }, [propUserEmail]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-72 sm:max-w-sm">
              <div className="px-2 py-6">
                <h2 className="text-lg font-medium">Checklist Inteligente</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <nav className="flex flex-col gap-4 px-2">
                <Button variant="ghost" className="justify-start" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <a 
            href="/dashboard" 
            className="flex items-center space-x-2 text-lg font-semibold tracking-tight"
          >
            <span className="hidden sm:inline-block bg-brand-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">
              CI
            </span>
            <span>Checklist Inteligente</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="hidden md:inline-block text-sm text-muted-foreground">
            {userEmail}
          </span>
          <Button 
            variant="ghost" 
            className="hidden md:flex"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
