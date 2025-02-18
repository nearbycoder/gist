import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { authClient } from '@/lib/auth-client';

export const UserRegister = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const form = useForm<z.infer<typeof UserRegister>>({
    resolver: zodResolver(UserRegister),
    defaultValues: {
      email: '',
      password: '',
      confirm: '',
    },
  });

  const signInWithGithub = async () => {
    const data = await authClient.signIn.social({
      provider: 'github',
      callbackURL: import.meta.env.VITE_BETTER_AUTH_URL,
    });

    if (data.error) {
      console.log('error', data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm">Sign up to get started</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign up with Github
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2">Or continue with</span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={(innerForm) => {
                form.clearErrors();
                innerForm.preventDefault();
                const formData = new FormData(
                  innerForm.target as HTMLFormElement
                );

                if (formData.get('password') !== formData.get('confirm')) {
                  form.setError('confirm', {
                    message: 'Passwords do not match',
                  });
                  return;
                }

                authClient.signUp.email(
                  {
                    email: formData.get('email') as string,
                    password: formData.get('password') as string,
                    name: formData.get('email') as string,
                  },
                  {
                    onSuccess: () => {
                      router.navigate({ to: '/' });
                      form.reset();
                    },
                    onError: (error) => {
                      console.log('error', error);
                      form.setError('email', {
                        message: error.error.message,
                      });
                    },
                  }
                );
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        className="w-full"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="w-full"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center text-sm">
          <span>Already have an account?</span>{' '}
          <Link
            to="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
