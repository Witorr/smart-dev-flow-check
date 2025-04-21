import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Trash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export interface Project {
  id: string;
  name: string;
  type: "Frontend" | "Backend" | "Full Stack" | "Mobile";
  technologies: string[];
  progress: number;
  created_at: string;
  user_id: string;
  attachments?: string[];
  is_team?: boolean;
  start_date?: string;
  end_date?: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const { navigateToProject } = useAuth();

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Frontend":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Backend":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Full Stack":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Mobile":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    if (project.id) {
      window.location.href = `/project/${project.id}`;
    }
  };

  // Função para cor por tecnologia
  const techColors: Record<string, string> = {
    React: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Node.js': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    TypeScript: 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-200',
    Python: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200',
    Django: 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-200',
    Laravel: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Vue.js': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Flutter: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    Java: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'C#': 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200',
    Go: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  };

  return (
    <Card className="h-full flex flex-col cursor-pointer hover:border-brand-300 transition-all duration-200 relative" onClick={handleClick}>
      <CardHeader className="pb-2 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <CardTitle className="truncate text-lg font-bold min-w-0 max-w-full" title={project.name}>
            {project.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`ml-2 shrink-0 whitespace-nowrap ${getBadgeVariant(project.type)}`}>{project.type}</Badge>
            {typeof onDelete === 'function' && (
              <button
                className="ml-1 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition"
                title="Excluir projeto"
                onClick={e => { e.stopPropagation(); onDelete(project.id); }}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {formatDate(project.created_at)}
        </CardDescription>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.attachments && project.attachments.length > 0 && (
            <span className="text-xs text-muted-foreground">Anexos: {project.attachments.length}</span>
          )}
          <span className="text-xs text-muted-foreground">Equipe: {project.is_team ? 'Time' : 'Individual'}</span>
          {project.start_date && project.end_date && (
            <span className="text-xs text-muted-foreground">{formatDate(project.start_date)} até {formatDate(project.end_date)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {project.technologies.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className={`text-xs ${techColors[tech] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}
            >
              {tech}
            </Badge>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-value" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
