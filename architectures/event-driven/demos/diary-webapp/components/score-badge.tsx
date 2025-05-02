import React from "react";
import { Badge } from "@/components/ui/badge";

type ScoreBadgeProps = {
  name: string;
  value: number;
};

export function ScoreBadge({ name, value }: ScoreBadgeProps) {
  // Determine the variant based on score value
  const getVariant = () => {
    if (value > 0.5) return "success";
    if (value < -0.3) return "destructive";
    return "secondary";
  };

  // Format the value for display
  const formattedValue = value.toFixed(2);

  return (
    <Badge variant={getVariant()}>
      <span className="flex items-center gap-1">
        <span className="opacity-80">{name}:</span>
        <span className="font-semibold">{formattedValue}</span>
      </span>
    </Badge>
  );
}
