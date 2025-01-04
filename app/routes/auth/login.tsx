import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { parseError } from '@/libs/utils';
import { UserLogin, loginUser } from '@/serverFunctions/auth';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const form = useForm<z.infer<typeof UserLogin>>({
    resolver: zodResolver(UserLogin),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-bold">Login</h1>
      <Form {...form}>
        <form
          onSubmit={(innerForm) => {
            form.clearErrors();
            innerForm.preventDefault();
            const formData = new FormData(innerForm.target as HTMLFormElement);
            loginUser({
              data: Object.fromEntries(formData) as {
                email: string;
                password: string;
              },
            })
              .then((result) => {
                if ('data' in result && 'error' in result.data) {
                  form.setError('email', { message: result.data.error });
                } else {
                  router.navigate({ to: '/' });
                  form.reset();
                }
              })
              .catch((error) => {
                parseError(form, error);
              });
          }}
          className="flex flex-col gap-4 max-w-md mx-auto w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="test@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Login</Button>
        </form>
      </Form>
      <div className="flex">
        <Link to="/auth/register">Register a new account</Link>
      </div>
    </div>
  );
}
