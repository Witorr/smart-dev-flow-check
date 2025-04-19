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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID provided.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim(),
          category: newTaskCategory,
          is_completed: false,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setTasks([data, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskCategory("feature");
      toast({
        title: "Success",
        description: "Task added successfully!",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Error: ${error.message}` 
          : "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (task: Task, isCompleted: boolean) => {
    setTasks(tasks.map(t => t.id === task.id ? { ...task, is_completed: isCompleted } : t));
  };

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

          <form onSubmit={handleAddTask} className="space-y-4 mb-8">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading || !newTaskTitle.trim()}>
              {isLoading ? "Adding..." : "Add Task"}
            </Button>
          </form>

          <div className="space-y-2">
            {tasks.map((task) => (
              <ChecklistItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
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
