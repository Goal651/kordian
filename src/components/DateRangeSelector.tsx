/* ============================================================================
   DATE RANGE SELECTOR - Floating Glass Component (Month/Year Selection)
   ============================================================================
   A beautiful floating glassmorphism date range picker that allows users
   to filter data by month and year for better performance and UX.
   ========================================================================== */

"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangeSelectorProps {
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
  orgCreatedAt?: string | null;
}

// Preset date ranges - SPECIFIC MONTHS, not rolling dates
const PRESETS = [
  {
    label: "This month",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = now; // Until today
      return { from, to };
    },
  },
  {
    label: "Last month",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to };
    },
  },
  {
    label: "Last 3 months",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const to = now;
      return { from, to };
    },
  },
  {
    label: "This year",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1);
      const to = now;
      return { from, to };
    },
  },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STORAGE_KEY = "nexus_date_range";

// Month/Year Picker Component
function MonthYearPicker({ 
  value, 
  onChange, 
  label,
  maxDate 
}: { 
  value: { month: number; year: number };
  onChange: (month: number, year: number) => void;
  label: string;
  maxDate?: Date;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      
      {/* Year Selector */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(value.month, value.year - 1)}
          disabled={value.year <= 2000}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <select
          value={value.year}
          onChange={(e) => onChange(value.month, parseInt(e.target.value))}
          className="flex-1 h-9 rounded-lg bg-secondary/50 border border-border/50 px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(value.month, value.year + 1)}
          disabled={value.year >= currentYear}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => {
          const isDisabled = maxDate && (
            value.year > maxDate.getFullYear() ||
            (value.year === maxDate.getFullYear() && index > maxDate.getMonth())
          );
          
          return (
            <button
              key={month}
              onClick={() => !isDisabled && onChange(index, value.year)}
              disabled={isDisabled}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                "hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed",
                value.month === index
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-foreground border border-transparent"
              )}
            >
              {month.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangeSelector({ onDateRangeChange, className, orgCreatedAt }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("This month");
  const [isCustom, setIsCustom] = useState(false);
  
  const now = new Date();
  const [fromMonth, setFromMonth] = useState({ month: now.getMonth(), year: now.getFullYear() });
  const [toMonth, setToMonth] = useState({ month: now.getMonth(), year: now.getFullYear() });

  // Generate dynamic month presets based on org creation date
  const [monthlyPresets, setMonthlyPresets] = useState<{ label: string; from: Date; to: Date }[]>([]);

  useEffect(() => {
    const presets: { label: string; from: Date; to: Date }[] = [];
    const minDate = orgCreatedAt ? new Date(orgCreatedAt) : new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    let current = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Limits to last 12 months or since org created
    for (let i = 0; i < 12; i++) {
        const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
        if (monthStart < minDate) break;
        
        const monthEnd = i === 0 
            ? new Date() // Current month ends today
            : new Date(current.getFullYear(), current.getMonth() + 1, 0); // Past months end at end of month
            
        presets.push({
            label: MONTHS[current.getMonth()] + " " + current.getFullYear(),
            from: monthStart,
            to: monthEnd
        });
        
        current.setMonth(current.getMonth() - 1);
    }
    setMonthlyPresets(presets);
  }, [orgCreatedAt]);

  const applyPreset = (label: string) => {
    const preset = PRESETS.find((p) => p.label === label);
    if (!preset) return;

    const range = preset.getValue();
    const dateRange: DateRange = {
      from: range.from,
      to: range.to,
      label,
    };

    console.log('📅 Applying preset:', label, {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    });

    setSelectedPreset(label);
    setIsCustom(false);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dateRange));

    // Notify parent
    onDateRangeChange(dateRange);
    setOpen(false);
  };

  const applyRange = (label: string, from: Date, to: Date) => {
    const dateRange: DateRange = { from, to, label };
    setSelectedPreset(label);
    setIsCustom(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dateRange));
    onDateRangeChange(dateRange);
    setOpen(false);
  };

  const applyCustomRange = () => {
    // Create dates from month/year (first day of from month, last day of to month)
    const from = new Date(fromMonth.year, fromMonth.month, 1);
    const to = new Date(toMonth.year, toMonth.month + 1, 0); // Last day of month

    const dateRange: DateRange = {
      from,
      to,
      label: "Custom",
    };

    console.log('📅 Applying custom range:', {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    });

    setSelectedPreset("Custom");
    setIsCustom(true);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dateRange));

    // Notify parent
    onDateRangeChange(dateRange);
    setOpen(false);
  };

  const formatDateRange = () => {
    if (isCustom) {
      return `${MONTHS[fromMonth.month].slice(0, 3)} ${fromMonth.year} - ${MONTHS[toMonth.month].slice(0, 3)} ${toMonth.year}`;
    }
    return selectedPreset;
  };

  const handleFromChange = (month: number, year: number) => {
    setFromMonth({ month, year });
    // Ensure 'to' is after 'from'
    if (year > toMonth.year || (year === toMonth.year && month > toMonth.month)) {
      setToMonth({ month, year });
    }
  };

  const handleToChange = (month: number, year: number) => {
    setToMonth({ month, year });
    // Ensure 'from' is before 'to'
    if (year < fromMonth.year || (year === fromMonth.year && month < fromMonth.month)) {
      setFromMonth({ month, year });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "glass-card-medium border-border/50 hover:border-primary/30",
            "transition-all duration-300 gap-2 font-normal",
            "hover:shadow-lg hover:scale-[1.02]",
            className
          )}
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">{formatDateRange()}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="popover-glass w-auto p-0 border-border/50"
        align="end"
        sideOffset={8}
      >
        <div className="flex">
          {/* Preset Options */}
          <div className="border-r border-border/50 p-3 space-y-1 min-w-[180px]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Time Range
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.label)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  "hover:bg-secondary/50 flex items-center justify-between group",
                  selectedPreset === preset.label && !isCustom
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground"
                )}
              >
                <span>{preset.label}</span>
                {selectedPreset === preset.label && !isCustom && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}

            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-2">
              Monthly Summary
            </p>
            <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
                {monthlyPresets.map((preset) => (
                <button
                    key={preset.label}
                    onClick={() => applyRange(preset.label, preset.from, preset.to)}
                    className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    "hover:bg-secondary/50 flex items-center justify-between group",
                    selectedPreset === preset.label && !isCustom
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground"
                    )}
                >
                    <span>{preset.label}</span>
                    {selectedPreset === preset.label && !isCustom && (
                    <Check className="h-4 w-4 text-primary" />
                    )}
                </button>
                ))}
            </div>

            <div className="pt-2 border-t border-border/50 mt-2">
              <button
                onClick={() => setIsCustom(true)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  "hover:bg-secondary/50 flex items-center justify-between",
                  isCustom
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground"
                )}
              >
                <span>Custom Range</span>
                {isCustom && <Check className="h-4 w-4 text-primary" />}
              </button>
            </div>
          </div>

          {/* Custom Month/Year Picker */}
          {isCustom && (
            <div className="p-4 space-y-4 min-w-[320px]">
              <MonthYearPicker
                value={fromMonth}
                onChange={handleFromChange}
                label="From Month"
              />

              <div className="border-t border-border/50" />

              <MonthYearPicker
                value={toMonth}
                onChange={handleToChange}
                label="To Month"
                maxDate={new Date()}
              />

              <Button
                onClick={applyCustomRange}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
              >
                Apply Custom Range
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ============================================================================
   FLOATING VARIANT - Positioned absolutely in top-right
   ========================================================================== */

export function FloatingDateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  return (
    <div className="fixed top-20 right-8 z-50 animate-fade-in">
      <DateRangeSelector
        onDateRangeChange={onDateRangeChange}
        className="shadow-xl backdrop-blur-glass-strong"
      />
    </div>
  );
}
