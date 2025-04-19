import { useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'feature' | 'bug' | 'improvement' | 'documentation';
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface ChecklistItemProps {
  task: Task;
  onToggle: (task: Task, isCompleted: boolean) => void;
}

const ChecklistItem = ({
  task,
  onToggle,
}: ChecklistItemProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = useCallback(async (checked: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_completed: checked,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;
      onToggle(task, checked);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [task, onToggle, toast, isUpdating]);

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'feature':
        return 'bg-blue-500';
      case 'bug':
        return 'bg-red-500';
      case 'improvement':
        return 'bg-green-500';
      case 'documentation':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border">
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="mt-1"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          <Badge variant="secondary" className={`${getCategoryColor(task.category)} text-white`}>
            {task.category}
          </Badge>
        </div>
        {task.description && (
          <p className={`text-sm text-muted-foreground ${task.is_completed ? 'line-through' : ''}`}>
            {task.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(task.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ChecklistItem;
