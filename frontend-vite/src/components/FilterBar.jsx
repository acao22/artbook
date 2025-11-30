import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function FilterBar({
  activeFilters,
  onToggleFilter,
  sortBy,
  onSortChange,
  openModal,
}) {
  // undef case
  const activeKeys = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] === true
  );

  const handleFilterChange = (values) => {
    if (!Array.isArray(values)) return;
    const updated = {};

    Object.keys(activeFilters).forEach((key) => {
      updated[key] = values.includes(key);
    });

    onToggleFilter(updated);
  };

  return (
    <div className="px-8 mt-4 mb-3 flex items-center justify-between flex-wrap gap-4">

      {/* LEFT FILTER BUTTOSN */}
      <ToggleGroup
        type="multiple"
        value={activeKeys}
        onValueChange={handleFilterChange}
        className="flex gap-3"
      >
        <ToggleGroupItem
          value="artwork"
          className="px-4 py-1.5 rounded-full text-sm 
          border border-[#d6d3cd]
          data-[state=on]:bg-[#CAC444] data-[state=on]:text-black"
        >
          Artwork
        </ToggleGroupItem>

        <ToggleGroupItem
          value="music"
          className="px-4 py-1.5 rounded-full text-sm
          border border-[#d6d3cd]
          data-[state=on]:bg-[#CAC444] data-[state=on]:text-black"
        >
          Music
        </ToggleGroupItem>

        <ToggleGroupItem
          value="books"
          className="px-4 py-1.5 rounded-full text-sm 
          border border-[#d6d3cd]
          data-[state=on]:bg-[#CAC444] data-[state=on]:text-black"
        >
          Books
        </ToggleGroupItem>

        <ToggleGroupItem
          value="movies"
          className="px-4 py-1.5 rounded-full text-sm 
          border border-[#d6d3cd]
          data-[state=on]:bg-[#CAC444] data-[state=on]:text-black"
        >
          Movies
        </ToggleGroupItem>
      </ToggleGroup>

      {/* RIGHT SIDE: sort and add */}
      <div className="flex items-center gap-4">

        {/* SORT DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-white"
            >
              Sort
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-32 bg-white">
            <DropdownMenuItem onClick={() => onSortChange("default")}>
              Default
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onSortChange("title")}>
              Title
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onSortChange("recent")}>
              Most Recent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ADD ITEM BUTTON */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={openModal}
              className="rounded-full bg-[#CAC444] hover:bg-[#b5b03f]
              text-black shadow-md w-10 h-10 flex items-center justify-center"
            >
              <Plus size={22} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new item</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
