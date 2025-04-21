import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";

export interface PopupTextProps {
  /**
   * The element that triggers the popup (e.g., a button or icon).
   */
  trigger: React.ReactNode;
  /**
   * The content to display inside the popup.
   */
  children: React.ReactNode;
  /**
   * Optional className for the PopoverContent.
   */
  className?: string;
  /**
   * Optional props for PopoverContent.
   */
  contentProps?: React.ComponentProps<typeof PopoverContent>;
}

/**
 * PopupText is a reusable component that shows a popup with custom content when the trigger is interacted with.
 *
 * Example usage:
 * <PopupText trigger={<button>Show Info</button>}>This is the popup content!</PopupText>
 */
export const PopupText: React.FC<PopupTextProps> = ({
  trigger,
  children,
  className,
  contentProps,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={className} {...contentProps}>
        {children}
      </PopoverContent>
    </Popover>
  );
};
