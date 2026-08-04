import { ReactElement } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface HintProps {
  label: string;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
}

export const Hint = ({ label, children, side, align, sideOffset, alignOffset }: HintProps) => {
  return (
    <Tooltip>
      <TooltipTrigger render={children}></TooltipTrigger>
      <TooltipContent
        className="text-white bg-black border-black"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <p className="font-semibold capitalize">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
