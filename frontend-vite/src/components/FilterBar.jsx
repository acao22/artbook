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

const LABELS = {
  artwork: "Artwork",
  music: "Music",
  books: "Books",
  movies: "Movies",
  concerts: "Concerts",
  museums: "Museums",
  theatre: "Theatre",
  other: "Other",
};

export default function FilterBar({
  activeFilters,
  onToggleFilter,
  sortBy,
  onSortChange,
  openModal,
  visibleFilters,
}) {
  // Determine which filters to show
  const filtersToRender =
    visibleFilters && visibleFilters.length > 0
      ? visibleFilters
      : Object.keys(activeFilters);

  const activeKeys = filtersToRender.filter((key) => activeFilters[key] === true);

  const handleFilterChange = (values) => {
    if (!Array.isArray(values)) return;

    const updated = { ...activeFilters };

    filtersToRender.forEach((key) => {
      updated[key] = values.includes(key);
    });

    onToggleFilter(updated);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 mt-6 mb-4 flex items-center justify-between flex-wrap gap-4">

      {/* LEFT SIDE — Filter Buttons */}
      <div className="flex items-center gap-3">

        {/* Label to make it clear these are filters */}
        <span className="text-sm font-medium text-muted-foreground tracking-wide">
          Filters:
        </span>

        <ToggleGroup
          type="multiple"
          value={activeKeys}
          onValueChange={handleFilterChange}
          className="flex gap-2"
        >
          {filtersToRender.map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="
                px-4 py-1.5 rounded-full text-sm transition-all duration-200
                border border-[#d6d3cd] shadow-sm

                hover:bg-[#f0ede5] hover:shadow-md hover:-translate-y-[1px]
                active:scale-95

                data-[state=on]:bg-[#CAC444]
                data-[state=on]:text-black
                data-[state=on]:border-[#CAC444]
                data-[state=on]:shadow-md
              "
            >
              {LABELS[key] || key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* RIGHT SIDE — Sort & Add Buttons */}
      <div className="flex items-center gap-4">

        {/* SORT DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="
                flex items-center gap-2 rounded-lg px-3 py-1.5 bg-white shadow-sm
                transition-all duration-200

                hover:shadow-md hover:-translate-y-[1px] hover:bg-[#f3f1ea]
                active:scale-95
              "
            >
              Sort
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-32 bg-white border border-[#e9e4db] shadow-lg"
          >
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
              className="
                rounded-full bg-[#CAC444] text-black shadow-md w-10 h-10
                flex items-center justify-center

                hover:bg-[#b5b03f] hover:shadow-lg hover:-translate-y-[1px]
                active:scale-95 transition-all duration-200
              "
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
