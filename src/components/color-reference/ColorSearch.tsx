
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FilterX } from "lucide-react";
import { pencilBrands } from "@/data/pencilColors";

interface ColorSearchProps {
  searchTerm: string;
  selectedBrand: string;
  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
}

const ColorSearch = ({ 
  searchTerm, 
  selectedBrand, 
  onSearchChange, 
  onBrandChange 
}: ColorSearchProps) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or code..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1.5 h-7 w-7"
            onClick={() => onSearchChange("")}
          >
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Tabs defaultValue={selectedBrand} onValueChange={onBrandChange}>
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="all" className="flex-1">All Brands</TabsTrigger>
          {pencilBrands.map(brand => (
            <TabsTrigger key={brand} value={brand} className="flex-1">
              {brand}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ColorSearch;
