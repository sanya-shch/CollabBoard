"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";

import { Input } from "@/components/ui/input";

export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounceValue(value, 500);

  useEffect(() => {
    const url = debouncedValue ? `/?search=${debouncedValue}` : "/";
    router.push(url);
  }, [debouncedValue, router]);

  return (
    <div className="w-full relative">
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search boards"
        className="w-full max-w-[516px] pl-9"
      />
    </div>
  );
};
