import * as React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownEditorProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
}

const MarkdownEditor = React.forwardRef<HTMLDivElement, MarkdownEditorProps>(
  ({ className, value, onChange, preview = true, ...props }, ref) => {
    const [tab, setTab] = React.useState<'write' | 'preview'>('write');

    if (!preview) {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={cn('rounded-md border', className)}>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'write' | 'preview')}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="write" className="p-0">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="border-0 rounded-none focus-visible:ring-0"
              {...props}
            />
          </TabsContent>
          <TabsContent value="preview" className="p-4 prose dark:prose-invert">
            <Markdown>{value || 'Nothing to preview'}</Markdown>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);
MarkdownEditor.displayName = 'MarkdownEditor';

interface MarkdownContentProps {
  children: string;
  className?: string;
}

const MarkdownContent = React.forwardRef<HTMLDivElement, MarkdownContentProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('prose dark:prose-invert max-w-none', className)}
      >
        <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {children}
        </Markdown>
      </div>
    );
  }
);
MarkdownContent.displayName = 'MarkdownContent';

export { MarkdownEditor, MarkdownContent };
