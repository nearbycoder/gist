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
  'sql',
  'elixir',
] as const;

export type ValidLanguage = (typeof validLanguages)[number];

export const languageDisplayNames: Record<ValidLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  sql: 'SQL',
  elixir: 'Elixir',
};
