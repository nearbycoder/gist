export interface Version {
  id: string;
  version: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  gistId: string;
}

export interface Gist {
  id: string;
  title: string;
  language: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  versions: Array<Version>;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  forkedFrom?: {
    id: string;
    title: string;
  } | null;
  isFavorite?: boolean;
}
