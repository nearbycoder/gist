import { Search } from 'lucide-react';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export const validLanguages = [
  'typescript',
  'javascript',
  'python',
  'rust',
  'go',
  'java',
  'csharp',
  'php',
  'ruby',
  'swift',
] as const;

export interface GistSearchProps {
  search: string;
  language: string | null;
  isPublic: boolean | null;
  favoritesOnly: boolean | null;
  onSearchChange: (search: string) => void;
  onLanguageChange: (language: string | null) => void;
  onIsPublicChange: (isPublic: boolean | null) => void;
  onFavoritesOnlyChange: (favoritesOnly: boolean | null) => void;
}

export function GistSearch({
  search,
  language,
  isPublic,
  favoritesOnly,
  onSearchChange,
  onLanguageChange,
  onIsPublicChange,
  onFavoritesOnlyChange,
}: GistSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-1 flex-wrap">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search gists..."
          className="pl-8 w-full"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Select
          value={language || '-'}
          onValueChange={(value) =>
            onLanguageChange(value === '-' ? null : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">All languages</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="ruby">Ruby</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-row sm:flex-row gap-4 justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <Switch
              id="public"
              checked={isPublic || false}
              onCheckedChange={(checked) => onIsPublicChange(checked || null)}
            />
            <Label htmlFor="public" className="whitespace-nowrap">
              Public only
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="favorites"
              checked={favoritesOnly || false}
              onCheckedChange={(checked) =>
                onFavoritesOnlyChange(checked || null)
              }
            />
            <Label htmlFor="favorites" className="whitespace-nowrap">
              Favorites only
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
