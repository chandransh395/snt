
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  name?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  onSelect?: (date: Date | null) => void; // Add this for backward compatibility
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

export function DatePicker({
  id,
  name,
  selected,
  onChange,
  onSelect,
  placeholder = "Select a date",
  disabled = false,
  minDate,
  className,
  showIcon = false,
  icon,
}: DatePickerProps) {
  const handleDateSelect = (date: Date | null) => {
    // Call both handlers for backward compatibility
    if (onChange) onChange(date);
    if (onSelect) onSelect(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          name={name}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {showIcon && (icon ? icon : <CalendarIcon className="mr-2 h-4 w-4" />)}
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          disabled={minDate ? { before: minDate } : undefined}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
