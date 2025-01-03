import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ZodError } from 'zod';
import type { UseFormReturn } from 'react-hook-form';
import type { ClassValue } from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function parseError(form: UseFormReturn<any>, error: ZodError) {
  const errors = JSON.parse(error.message);

  if (!errors.body && errors instanceof Array) {
    errors.map((err) => {
      form.setError(err.path[0], { message: err.message });
    });

    return;
  }

  if (errors.body.issues) {
    errors.body.issues.map((issue: any) => {
      form.setError(issue.path[0], { message: issue.message });
    });
  } else {
    switch (errors.body.name) {
      case 'PrismaClientKnownRequestError':
        form.setError(errors.body.meta.target[0], {
          message: 'This email is already in use',
        });
        break;
    }
  }
}
