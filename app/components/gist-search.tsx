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

interface GistSearchProps {
  search: string;
  language: string | null;
  isPublic: boolean | null;
  onSearchChange: (search: string) => void;
  onLanguageChange: (language: string | null) => void;
  onIsPublicChange: (isPublic: boolean | null) => void;
}

export function GistSearch({
  search,
  language,
  isPublic,
  onSearchChange,
  onLanguageChange,
  onIsPublicChange,
}: GistSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end flex-1 max-w-3xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search gists..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-3 items-center">
        <Select
          value={language || ''}
          onValueChange={(val) => onLanguageChange(val || null)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">All languages</SelectItem>
            {validLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 min-w-[120px]">
          <Label className="cursor-pointer">Public only</Label>
          <Switch
            checked={isPublic || false}
            onCheckedChange={(checked) => onIsPublicChange(checked || null)}
          />
        </div>
      </div>
    </div>
  );
}
