import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServerFn } from '@tanstack/start';
import { zodValidator } from '@tanstack/zod-adapter';
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
import { hashPassword, prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';
import { parseError } from '@/libs/utils';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

const UserLogin = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginUser = createServerFn({ method: 'POST' })
  .validator(zodValidator(UserLogin))
  .handler(async ({ data }) => {
    const user = await prisma.user.findFirst({ where: { email: data.email } });

    if (!user || (await hashPassword(data.password)) !== user.password) {
      return {
        data: {
          error: 'Email or password is incorrect',
        },
      };
    }

    // Create a session
    const session = await useAppSession();

    // Store the user's email in the session
    await session.update({
      userEmail: user.email,
    });

    return user;
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
