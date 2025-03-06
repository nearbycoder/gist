import { defineConfig } from '@tanstack/react-start-config';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    preset: 'node-server',
  },
  vite: {
    plugins: [
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }) as any,
      tailwindcss(),
    ],
  },
});
