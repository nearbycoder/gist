import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Editor } from '@/components/Editor.client';
import { getGist, updateGist } from '@/serverFunctions/gists';

const EditGistSchema = z.object({
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

export const Route = createFileRoute('/_dashboard/gists/$id/edit')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const gist = await getGist({
      data: {
        id: params.id,
      },
    });

    if (!gist) {
      throw new Error('Gist not found');
    }

    return gist;
  },
});

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

function RouteComponent() {
  const gist = Route.useLoaderData();
  const router = useRouter();

  const defaultLanguage = 'typescript';
  const initialLanguage = validLanguages.includes(gist.language as any)
    ? gist.language
    : defaultLanguage;

  const form = useForm<z.infer<typeof EditGistSchema>>({
    resolver: zodResolver(EditGistSchema),
    defaultValues: {
      title: gist.title || '',
      body: gist.versions[0].body || '',
      language: initialLanguage as z.infer<typeof EditGistSchema>['language'],
      isPublic: gist.isPublic || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof EditGistSchema>) => {
    await updateGist({
      data: {
        id: gist.id,
        ...values,
      },
    });

    await router.invalidate();

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
                    <SelectValue placeholder="TypeScript" />
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
              <FormLabel className="mt-2">Public</FormLabel>
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
                <span className="text-sm text-gray-300">
                  Version {gist.versions[0].version + 1}
                </span>
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
          <Button type="submit">Update Gist</Button>
        </div>
      </form>
    </Form>
  );
}
