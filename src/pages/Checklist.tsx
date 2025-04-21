import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import ChecklistItem, { Task } from "@/components/ChecklistItem";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";

const Checklist = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isAuthenticated, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("feature");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");
  const [newTaskEndDate, setNewTaskEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProjectData = useCallback(async () => {
    if (!projectId || !isAuthenticated) return;

    try {
      // Load project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      if (projectData) {
        setProjectName(projectData.name);
      }

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data. Please try again.",
        variant: "destructive",
      });
    }
  }, [projectId, isAuthenticated, toast]);

  useEffect(() => {
    if (isInitialized) return;
    
    const initialize = async () => {
      if (!isAuthenticated || !projectId) return;
      
      await loadProjectData();
      setIsInitialized(true);
    };

    initialize();
  }, [isAuthenticated, projectId, loadProjectData, isInitialized]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast({ title: "Error", description: "Task title is required", variant: "destructive" });
      return;
    }
    if (!newTaskStartDate || !newTaskEndDate) {
      toast({ title: "Error", description: "Start and end date are required.", variant: "destructive" });
      return;
    }
    if (!projectId) {
      toast({ title: "Error", description: "No project ID provided.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle,
          description: newTaskDescription,
          category: newTaskCategory,
          project_id: projectId,
          user_id: user.id,
          is_completed: false,
          start_date: newTaskStartDate,
          end_date: newTaskEndDate
        })
        .select()
        .single();
      if (error) throw error;
      setTasks([data, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskCategory("feature");
      setNewTaskStartDate("");
      setNewTaskEndDate("");
      toast({ title: "Success", description: "Task added successfully!" });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? `Error: ${error.message}` : "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || "");
    setNewTaskCategory(task.category);
    setNewTaskStartDate(task.start_date || "");
    setNewTaskEndDate(task.end_date || "");
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: newTaskTitle,
          description: newTaskDescription,
          category: newTaskCategory,
          start_date: newTaskStartDate,
          end_date: newTaskEndDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTaskId);
      if (error) throw error;
      setTasks(tasks.map(t => t.id === editingTaskId ? {
        ...t,
        title: newTaskTitle,
        description: newTaskDescription,
        category: newTaskCategory,
        start_date: newTaskStartDate,
        end_date: newTaskEndDate
      } : t));
      setEditingTaskId(null);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskCategory("feature");
      setNewTaskStartDate("");
      setNewTaskEndDate("");
      toast({ title: "Task atualizada!" });
    } catch (error) {
      toast({ title: "Erro ao atualizar task", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (task: Task, isCompleted: boolean) => {
    setTasks(tasks.map(t => t.id === task.id ? { ...task, is_completed: isCompleted } : t));
    try {
      // Atualiza o status da task no banco
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);
      if (updateError) throw updateError;

      // Busca todas as tasks do projeto
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
      if (tasksError) throw tasksError;

      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((t: any) => t.is_completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Atualiza o campo progress do projeto
      const { error: projectError } = await supabase
        .from('projects')
        .update({ progress })
        .eq('id', projectId);
      if (projectError) throw projectError;

      // Notifica atualização de progresso para o dashboard
      localStorage.setItem(`project-progress-updated-${projectId}`, Date.now().toString());
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o progresso do projeto.',
        variant: 'destructive',
      });
    }
  };

  const handleTaskSubmit = editingTaskId ? handleUpdateTask : handleAddTask;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{projectName || "Project Tasks"}</h1>
              {projectName && (
                <p className="text-muted-foreground">Manage tasks for this project</p>
              )}
            </div>
            <Button 
              onClick={() => window.location.href = "/dashboard"} 
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>

          <form onSubmit={handleTaskSubmit} className="flex flex-col gap-2 mb-6">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Task description (opcional)"
              value={newTaskDescription}
              onChange={e => setNewTaskDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                placeholder="Início"
                value={newTaskStartDate}
                onChange={e => setNewTaskStartDate(e.target.value)}
                required
              />
              <Input
                type="datetime-local"
                placeholder="Fim"
                value={newTaskEndDate}
                onChange={e => setNewTaskEndDate(e.target.value)}
                required
              />
            </div>
            <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Feature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (editingTaskId ? "Atualizando..." : "Adicionando...") : (editingTaskId ? "Update Task" : "Add Task")}
            </Button>
            {editingTaskId && (
              <Button type="button" variant="outline" onClick={() => { setEditingTaskId(null); setNewTaskTitle(""); setNewTaskDescription(""); setNewTaskCategory("feature"); setNewTaskStartDate(""); setNewTaskEndDate(""); }}>Cancelar edição</Button>
            )}
          </form>

          <div className="space-y-2">
            {tasks.map((task) => (
              <ChecklistItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
              />
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No tasks yet. Add your first task above!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checklist;
