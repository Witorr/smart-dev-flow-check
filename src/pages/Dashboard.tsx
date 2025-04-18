
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import ProjectCard, { Project } from "@/components/ProjectCard";
import { PlusIcon, Search, Filter } from "lucide-react";

// Mock projects data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce App",
    type: "Full Stack",
    technologies: ["React", "Node.js", "MongoDB"],
    progress: 75,
    createdAt: "12 abril 2023"
  },
  {
    id: "2",
    name: "Blog API",
    type: "Backend",
    technologies: ["Express", "PostgreSQL", "TypeScript"],
    progress: 40,
    createdAt: "23 março 2023"
  },
  {
    id: "3",
    name: "Aplicativo de Finanças",
    type: "Mobile",
    technologies: ["React Native", "Firebase"],
    progress: 90,
    createdAt: "5 maio 2023"
  },
  {
    id: "4",
    name: "Landing Page Corporativa",
    type: "Frontend",
    technologies: ["Vue.js", "TailwindCSS"],
    progress: 60,
    createdAt: "17 junho 2023"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects] = useState<Project[]>(mockProjects);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie seus projetos e checklists
            </p>
          </div>
          <Button 
            className="bg-brand-500 hover:bg-brand-600"
            onClick={() => navigate("/create-project")}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Criar Novo Projeto
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="sm:w-auto gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtrar</span>
          </Button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente mudar os termos da busca ou crie um novo projeto.
            </p>
            <Button 
              className="mt-4 bg-brand-500 hover:bg-brand-600"
              onClick={() => navigate("/create-project")}
            >
              Criar Novo Projeto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
