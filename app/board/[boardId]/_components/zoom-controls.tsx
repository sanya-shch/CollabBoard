"use client";

import { Minus, Plus } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { MIN_ZOOM, MAX_ZOOM } from "@/lib/utils";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-2 left-2 bg-white rounded-md p-1.5 flex items-center gap-x-1 shadow-md select-none">
      <Hint label="Zoom out" side="top" sideOffset={14}>
        <Button variant="board" size="icon" onClick={onZoomOut} disabled={zoom <= MIN_ZOOM}>
          <Minus />
        </Button>
      </Hint>

      <Hint label="Reset zoom to 100%" side="top" sideOffset={14}>
        <button
          onClick={onReset}
          className="text-xs font-medium text-neutral-600 w-12 text-center hover:text-neutral-900"
        >
          {Math.round(zoom * 100)}%
        </button>
      </Hint>

      <Hint label="Zoom in" side="top" sideOffset={14}>
        <Button variant="board" size="icon" onClick={onZoomIn} disabled={zoom >= MAX_ZOOM}>
          <Plus />
        </Button>
      </Hint>
    </div>
  );
};
