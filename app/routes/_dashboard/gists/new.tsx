import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { validLanguages } from './$id/edit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const GistSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Content is required'),
  language: z.enum([
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
  ]),
  isPublic: z.boolean(),
});

type GistFormValues = z.infer<typeof GistSchema>;

export const Route = createFileRoute('/_dashboard/gists/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const form = useForm<GistFormValues>({
    resolver: zodResolver(GistSchema),
    defaultValues: {
      title: '',
      body: '',
      language: 'typescript',
      isPublic: false,
    },
  });

  const onSubmit = async (data: GistFormValues) => {
    const gist = await createGist({
      data,
    });

    router.navigate({
      to: `/gists/${gist.id}`,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-6 h-full flex flex-col"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter gist title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {validLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language.charAt(0).toUpperCase() + language.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex gap-2 items-center">
              <FormLabel>Public</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem className="h-[calc(100%-300px)]">
              <div className="flex items-center justify-between">
                <FormLabel>Content</FormLabel>
                <span className="text-sm text-gray-300">Version 1</span>
              </div>
              <FormControl>
                <Editor
                  language={form.watch('language')}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex relative justify-end pt-8">
          <Button type="submit">Create Gist</Button>
        </div>
      </form>
    </Form>
  );
}
