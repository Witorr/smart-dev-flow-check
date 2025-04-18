
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  onToggle: (id: string, isCompleted: boolean) => void;
}

const ChecklistItem = ({
  id,
  title,
  description,
  isCompleted,
  onToggle,
}: ChecklistItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    onToggle(id, !isCompleted);
  };

  return (
    <div className="border rounded-md p-4 mb-2 hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`item-${id}`}
          checked={isCompleted}
          onCheckedChange={handleToggle}
          className="mt-1"
        />
        <div className="flex-1">
          <label
            htmlFor={`item-${id}`}
            className={cn(
              "text-base font-medium cursor-pointer flex items-center",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {title}
          </label>
          {description && (
            <div
              className={cn(
                "text-sm text-muted-foreground mt-1",
                isCompleted && "line-through opacity-70"
              )}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
