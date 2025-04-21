import ProfileMenu from "@/components/ProfileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-8 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-brand-500 transition">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">Configurações do Perfil</h1>
        <ThemeToggle />
      </div>
      <div className="bg-card rounded-xl shadow-md p-8 flex flex-col items-center gap-4 animate-fade-in">
        <ProfileMenu />
      </div>
    </div>
  );
}
