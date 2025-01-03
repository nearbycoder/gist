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

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
});

const UserRegister = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

const registerUser = createServerFn({ method: 'POST' })
  .validator(zodValidator(UserRegister))
  .handler(async ({ data }) => {
    const currentUser = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (data.password !== data.confirm) {
      return {
        data: {
          error: 'Passwords do not match',
        },
      };
    }

    if (currentUser) {
      return {
        data: {
          error: 'Email or password is incorrect',
        },
      };
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

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
  const form = useForm<z.infer<typeof UserRegister>>({
    resolver: zodResolver(UserRegister),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Register</h1>
      <Form {...form}>
        <form
          onSubmit={(innerForm) => {
            form.clearErrors();
            innerForm.preventDefault();
            const formData = new FormData(innerForm.target as HTMLFormElement);
            registerUser({
              data: Object.fromEntries(formData) as {
                email: string;
                password: string;
                confirm: string;
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
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Register</Button>
        </form>
      </Form>
      <div className="flex">
        <Link to="/auth/login">Login with existing account</Link>
      </div>
    </div>
  );
}
