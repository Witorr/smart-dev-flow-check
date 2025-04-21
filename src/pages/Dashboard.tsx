import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import ProjectCard, { Project as ProjectType } from "@/components/ProjectCard";
import { PlusIcon, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import SmartChecklistModal from "@/components/SmartChecklistModal";
import ProfileMenu from "@/components/ProfileMenu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  const projectTypes = ["Backend", "Frontend", "Full Stack", "Mobile"];
  const allTechnologies = Array.from(new Set(projects.flatMap(p => p.technologies)));

  useEffect(() => {
    loadProjects();
    // Atualização em tempo real do progresso via localStorage
    const handleStorage = (event: StorageEvent) => {
      if (event.key && (event.key.startsWith('project-progress-updated-') || event.key === 'project-created')) {
        loadProjects();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para excluir projeto e suas tarefas
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto e todas as suas tarefas? Essa ação não pode ser desfeita.')) return;
    setIsLoading(true);
    try {
      // Exclui tasks primeiro
      let { error: taskError } = await supabase.from('tasks').delete().eq('project_id', projectId);
      if (taskError) throw taskError;
      // Exclui projeto
      let { error: projectError } = await supabase.from('projects').delete().eq('id', projectId);
      if (projectError) throw projectError;
      toast({ title: 'Projeto excluído com sucesso!' });
      loadProjects();
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(types =>
      types.includes(type) ? types.filter(t => t !== type) : [...types, type]
    );
  };
  const handleTechToggle = (tech: string) => {
    setSelectedTechs(techs =>
      techs.includes(tech) ? techs.filter(t => t !== tech) : [...techs, tech]
    );
  };
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedTechs([]);
  };

  // Filtragem combinada
  const filteredProjects = projects.filter(project => {
    // Busca texto
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    // Tipo
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(project.type);
    // Tecnologia
    const matchesTech = selectedTechs.length === 0 || selectedTechs.some(t => project.technologies.includes(t));
    return matchesSearch && matchesType && matchesTech;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto py-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
            <p className="text-muted-foreground">Gerencie seus projetos e checklists</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              className="bg-brand-500 hover:bg-brand-600 w-full sm:w-auto"
              onClick={() => navigate("/create-project")}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Novo Projeto
            </Button>
            <Button 
              variant="outline"
              className="border-brand-500 text-brand-500 hover:bg-brand-50 w-full sm:w-auto"
              onClick={() => setShowSmartModal(true)}
            >
              🤖 Criar Checklist Inteligente
            </Button>
          </div>
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
          <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="sm:w-auto gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filtrar Projetos</DrawerTitle>
                <DrawerDescription>Selecione o tipo e/ou tecnologias para filtrar seus projetos.</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <div>
                  <span className="font-semibold">Tipo de Projeto</span>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {projectTypes.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => handleTypeToggle(type)} />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Tecnologias</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTechnologies.map(tech => (
                      <label key={tech} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={selectedTechs.includes(tech)} onCheckedChange={() => handleTechToggle(tech)} />
                        <span>{tech}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                  <DrawerClose asChild>
                    <Button className="bg-brand-500 text-white">Aplicar</Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 p-8 text-center bg-card rounded-lg border">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery 
                ? "Tente mudar os termos da busca."
                : "Comece criando seu primeiro projeto."}
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
              <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
            ))}
          </div>
        )}
      </main>
      <SmartChecklistModal 
        open={showSmartModal} 
        onClose={() => setShowSmartModal(false)}
        onSubmit={async (data) => {
          // Salva o projeto no Supabase com os novos campos
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          // 1. Cria o projeto
          const { data: projectData, error: projectError } = await supabase.from('projects').insert([
            {
              name: data.projectName || 'Projeto Inteligente',
              type: data.teamType === 'time' ? 'Full Stack' : 'Backend',
              technologies: data.technologies,
              progress: 0,
              user_id: user.id,
              attachments: data.attachments,
              is_team: data.is_team,
              start_date: data.start_date,
              end_date: data.end_date
            }
          ]).select().single();
          if (projectError || !projectData) {
            toast({ title: "Erro ao criar projeto", description: projectError?.message, variant: "destructive" });
            return;
          }
          // 2. Cria as tasks automáticas do checklist
          if (Array.isArray(data.checklist) && data.checklist.length > 0) {
            const tasksToInsert = data.checklist.map((title: string) => ({
              title,
              project_id: projectData.id,
              user_id: user.id,
              is_completed: false,
              category: 'feature',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            await supabase.from('tasks').insert(tasksToInsert);
          }
          localStorage.setItem('project-created', Date.now().toString());
          toast({ title: "Projeto criado com sucesso!" });
          setShowSmartModal(false);
          loadProjects();
        }}
      />
    </div>
  );
};

export default Dashboard;
