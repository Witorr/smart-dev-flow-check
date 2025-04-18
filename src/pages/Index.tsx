
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">
            CI
          </div>
          <span className="font-semibold text-lg">Checklist Inteligente</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="text-brand-500 hover:text-brand-600 hover:bg-transparent"
          >
            Login
          </Button>
          <Button 
            className="bg-brand-500 hover:bg-brand-600"
            onClick={() => navigate("/register")}
          >
            Cadastre-se
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 p-4 md:p-8 animate-fade-in">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Checklist Inteligente para Desenvolvimento
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Organize, acompanhe e otimize seus projetos de desenvolvimento com checklists inteligentes personalizados para cada tipo de projeto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-brand-500 hover:bg-brand-600 h-12 px-6"
              onClick={() => navigate("/register")}
            >
              Começar Agora
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 px-6"
              onClick={() => navigate("/login")}
            >
              Fazer Login
            </Button>
          </div>
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="glassmorphism p-6 rounded-xl card-shadow">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded border border-brand-500 flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-brand-500 rounded-sm"></div>
                </div>
                <span className="font-medium">Configurar ambiente de desenvolvimento</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded border border-brand-500 flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-brand-500 rounded-sm"></div>
                </div>
                <span className="font-medium">Inicializar repositório Git</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded border border-gray-300 mr-3"></div>
                <span>Configurar ESLint e Prettier</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded border border-gray-300 mr-3"></div>
                <span>Criar estrutura de diretórios</span>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: "50%" }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2023 Checklist Inteligente de Desenvolvimento. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
