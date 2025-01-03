import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Editor } from '@/components/Editor.client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createGist } from '@/serverFunctions/gists';

export const Route = createFileRoute('/_dashboard/gists/new')({
  component: RouteComponent,
});
function RouteComponent() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const [language, setLanguage] = useState('typescript');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gist = await createGist({
      data: {
        title,
        body,
        language,
        isPublic,
      },
    });

    router.navigate({
      to: `/gists/${gist.id}`,
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 h-full flex flex-col"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter gist title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Language</Label>
          <Select onValueChange={(v) => setLanguage(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="TypeScript" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="swift">Swift</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex gap-2 items-center">
          <Label htmlFor="body" className="mt-2">
            Public
          </Label>
          <Switch
            defaultChecked={isPublic}
            onCheckedChange={(v) => setIsPublic(v)}
          />
        </div>
        <div className="space-y-2 h-[calc(100%-300px)]">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Content</Label>
            <span className="text-sm text-gray-300">Version 1</span>
          </div>
          <Editor
            language={language}
            value={body}
            onChange={(v) => setBody(v || '')}
          />
        </div>
        <div className="flex relative justify-end pt-8">
          <Button type="submit">Create Gist</Button>
        </div>
      </form>
    </>
  );
}
