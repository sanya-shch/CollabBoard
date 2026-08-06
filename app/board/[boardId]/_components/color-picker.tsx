"use client";

import { Color } from "@/types/canvas";
import { colorToCss } from "@/lib/utils";

interface ColorPickerProps {
  onChange: (color: Color) => void;
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200">
      <ColorButton color={{ r: 249, g: 194, b: 208 }} onClick={onChange} />
      <ColorButton color={{ r: 246, g: 230, b: 165 }} onClick={onChange} />
      <ColorButton color={{ r: 185, g: 229, b: 160 }} onClick={onChange} />
      <ColorButton color={{ r: 196, g: 226, b: 243 }} onClick={onChange} />
      <ColorButton color={{ r: 164, g: 147, b: 194 }} onClick={onChange} />
      <ColorButton color={{ r: 247, g: 158, b: 106 }} onClick={onChange} />
      <ColorButton color={{ r: 0, g: 0, b: 0 }} onClick={onChange} />
      <ColorButton color={{ r: 255, g: 255, b: 255 }} onClick={onChange} />
    </div>
  );
};

interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
}

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
  return (
    <button
      className="w-8 h-8 items-center flex justify-center hover:opacity-75 transition"
      onClick={() => onClick(color)}
    >
      <div
        className="h-8 w-8 rounded-md border border-neutral-300"
        style={{ background: colorToCss(color) }}
      />
    </button>
  );
};
