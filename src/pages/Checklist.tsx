
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ChecklistItem from "@/components/ChecklistItem";
import { Upload, Share2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ChecklistTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  category: "setup" | "development" | "deployment";
}

// Mock checklist tasks
const mockTasks: ChecklistTask[] = [
  {
    id: "1",
    title: "Configurar ambiente de desenvolvimento",
    description: "Instalar Node.js, Git e ferramentas necessárias",
    isCompleted: true,
    category: "setup"
  },
  {
    id: "2",
    title: "Inicializar repositório Git",
    description: "Criar .gitignore e fazer commit inicial",
    isCompleted: true,
    category: "setup"
  },
  {
    id: "3",
    title: "Configurar ESLint e Prettier",
    description: "Definir regras de formatação de código",
    isCompleted: false,
    category: "setup"
  },
  {
    id: "4",
    title: "Criar estrutura de diretórios",
    description: "Organizar arquivos e pastas do projeto",
    isCompleted: false,
    category: "setup"
  },
  {
    id: "5",
    title: "Implementar autenticação de usuários",
    description: "Login, registro e recuperação de senha",
    isCompleted: false,
    category: "development"
  },
  {
    id: "6",
    title: "Criar componentes de interface",
    description: "Botões, formulários, cards, etc.",
    isCompleted: false,
    category: "development"
  },
  {
    id: "7",
    title: "Implementar gerenciamento de estado",
    description: "Configurar Redux, Context API ou outra solução",
    isCompleted: false,
    category: "development"
  },
  {
    id: "8",
    title: "Configurar servidor de produção",
    description: "Preparar ambiente para deploy",
    isCompleted: false,
    category: "deployment"
  },
  {
    id: "9",
    title: "Configurar CI/CD",
    description: "Automação de testes e deploy",
    isCompleted: false,
    category: "deployment"
  }
];

const Checklist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<ChecklistTask[]>(mockTasks);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [projectName, setProjectName] = useState("E-commerce App");
  
  useEffect(() => {
    // Calculate progress percentage
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const progressPercentage = Math.round((completedTasks / tasks.length) * 100);
    setProgress(progressPercentage);
  }, [tasks]);
  
  const handleToggleTask = (taskId: string, isCompleted: boolean) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, isCompleted } : task
      )
    );
  };
  
  const filteredTasks = tasks.filter(task => 
    activeTab === "all" || task.category === activeTab
  );

  const handleShare = () => {
    toast({
      title: "Link copiado!",
      description: "O link do checklist foi copiado para a área de transferência.",
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload de arquivo",
      description: "Funcionalidade de upload será implementada em breve.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/dashboard")}
          >
            ← Voltar para o Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{projectName}</h1>
              <div className="flex items-center mt-2">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="ml-3 text-sm font-medium">{progress}%</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={handleUpload}>
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Compartilhar</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="setup">Configuração</TabsTrigger>
              <TabsTrigger value="development">Desenvolvimento</TabsTrigger>
              <TabsTrigger value="deployment">Deploy</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-1">
            {filteredTasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Não há tarefas disponíveis para esta categoria.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <ChecklistItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  isCompleted={task.isCompleted}
                  onToggle={handleToggleTask}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checklist;
