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
  start_date?: string;
  end_date?: string;
}

interface ChecklistItemProps {
  task: Task;
  onToggle: (task: Task, isCompleted: boolean) => void;
  onEdit?: (task: Task) => void;
}

const ChecklistItem = ({
  task,
  onToggle,
  onEdit,
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
    <div className={cn("border rounded-lg p-4 flex flex-col gap-2 bg-background", isUpdating && "opacity-60")}
      style={{ minWidth: 0 }}>
      <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 max-w-full flex-1">
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="shrink-0"
          />
          <h3 className="font-semibold text-base truncate max-w-[60%] min-w-0" title={task.title}>
            {task.is_completed ? <s>{task.title}</s> : task.title}
            {onEdit && (
              <button
                type="button"
                aria-label="Editar"
                onClick={() => onEdit(task)}
                className="ml-2 text-muted-foreground hover:text-primary"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </button>
            )}
          </h3>
        </div>
        <Badge variant="secondary" className={`text-xs shrink-0 whitespace-nowrap ${getCategoryColor(task.category)} text-white`}>
          {task.category}
        </Badge>
        {/* Rótulo "Agende no Calendly" que vira botão */}
        <span
          className="ml-2 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition cursor-pointer select-none"
          onClick={() => {
            // Extrai a data no formato YYYY-MM-DD
            let dateParam = '';
            if (task.start_date) {
              const d = new Date(task.start_date);
              // Garante o formato YYYY-MM-DD
              dateParam = d.toISOString().slice(0, 10);
            }
            const prefill = {
              name: task.title,
              a1: task.start_date || '', // data/hora completa para pergunta personalizada
              a2: task.description || ''
            };
            // Monta a URL com o parâmetro date correto
            let url = `https://calendly.com/jwitortech/30min?` + new URLSearchParams(Object.entries(prefill).filter(([_, v]) => v)).toString();
            if (dateParam) {
              url += `&date=${dateParam}`;
            }
            // @ts-ignore
            if (window.Calendly) {
              window.Calendly.initPopupWidget({ url });
            } else {
              window.open(url, '_blank');
            }
          }}
        >
          Agende no Calendly
        </span>
      </div>
      {task.description && (
        <p className={`text-sm text-muted-foreground break-words ${task.is_completed ? 'line-through' : ''}`}
           style={{ wordBreak: 'break-word' }}>
          {task.description}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Data agendada: {task.start_date ? new Date(task.start_date).toLocaleString() : 'Não definida'}
      </p>
    </div>
  );
};

export default ChecklistItem;
