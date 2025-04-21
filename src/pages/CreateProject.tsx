import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const projectTypes = ["Frontend", "Backend", "Full Stack", "Mobile"];

const suggestedTechnologies = [
  "React", "Vue.js", "Angular", "Next.js", "TypeScript", 
  "Node.js", "Express", "Django", "Flask", "Laravel",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", 
  "React Native", "Flutter", "Swift", "Kotlin"
];

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTech = (tech: string) => {
    if (tech && !technologies.includes(tech)) {
      setTechnologies([...technologies, tech]);
      setNewTech("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || technologies.length === 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar o projeto
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name,
            type,
            technologies,
            progress: 0,
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Notificar o Slack
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-checklist/slack-notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName: name, creator: user.email || user.id })
        });
      } catch (err) {
        // Não bloquear criação se Slack falhar
        console.warn('Falha ao notificar Slack:', err);
      }

      toast({
        title: "Projeto criado com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Criar Novo Projeto</CardTitle>
              <CardDescription>
                Configure as informações básicas do seu novo projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: E-commerce App"
                    required
                  />
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Projeto</Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo do projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
                <div className="space-y-2">
                  <Label>Tecnologias Principais</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {technologies.map(tech => (
                      <Badge key={tech} variant="secondary" className="px-2 py-1 text-sm">
                        {tech}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-1 rounded-full hover:bg-muted inline-flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remover {tech}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Adicionar tecnologia"
                      className="flex-grow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech(newTech);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleAddTech(newTech)}
                    >
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Sugestões:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestedTechnologies
                        .filter(tech => !technologies.includes(tech))
                        .slice(0, 8)
                        .map(tech => (
                          <Badge 
                            key={tech} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-secondary transition-colors"
                            onClick={() => handleAddTech(tech)}
                          >
                            {tech}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
                
                <CardFooter className="flex justify-between pt-6 px-0">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-brand-500 hover:bg-brand-600"
                    disabled={isSubmitting || !name || !type || technologies.length === 0}
                  >
                    {isSubmitting ? "Criando..." : "Criar Projeto"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
