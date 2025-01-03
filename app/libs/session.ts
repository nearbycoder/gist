import { useSession } from 'vinxi/http';
import type { User } from '@prisma/client';

type SessionUser = {
  userEmail: User['email'];
};

export function useAppSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set');
  }

  return useSession<SessionUser>({
    password: process.env.SESSION_SECRET,
  });
}
