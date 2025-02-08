import { createFileRoute } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  UpdatePassword,
  UpdateUserName,
  fetchUser,
  updatePassword,
  updateUserName,
} from '@/serverFunctions/auth';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_dashboard/settings')({
  component: SettingsPage,
  loader: async () => {
    const user = await fetchUser();

    return user;
  },
});

function SettingsPage() {
  const { toast } = useToast();
  const user = Route.useLoaderData();

  const nameForm = useForm<z.infer<typeof UpdateUserName>>({
    resolver: zodResolver(UpdateUserName),
    defaultValues: {
      name: user.name || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof UpdatePassword>>({
    resolver: zodResolver(UpdatePassword),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onUpdateName = async (values: z.infer<typeof UpdateUserName>) => {
    try {
      await updateUserName({ data: values });
      toast({
        title: 'Success',
        description: 'Your name has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update name. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onUpdatePassword = async (values: z.infer<typeof UpdatePassword>) => {
    try {
      const result = await updatePassword({ data: values });
      if (result.data?.error) {
        toast({
          title: 'Error',
          description: result.data.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Success',
        description: 'Your password has been updated.',
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 overflow-y-auto">
      <h1 className="text-4xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...nameForm}>
            <form
              onSubmit={nameForm.handleSubmit(onUpdateName)}
              className="space-y-4"
            >
              <Label>Email</Label>
              <Input placeholder="Your email" disabled value={user.email} />
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm">
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Current password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm">
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
