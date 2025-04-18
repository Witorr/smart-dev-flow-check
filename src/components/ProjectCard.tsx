
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Project {
  id: string;
  name: string;
  type: "Frontend" | "Backend" | "Full Stack" | "Mobile";
  technologies: string[];
  progress: number;
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

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
        return "";
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      className="card-shadow cursor-pointer hover:border-brand-200 transition-all duration-300 h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <Badge variant="outline" className={getBadgeVariant(project.type)}>
            {project.type}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> 
          <span>{project.createdAt}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 my-2">
          {project.technologies.map((tech, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1 text-xs">
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
