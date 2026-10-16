export const PAGE_SIZE = 10;

export interface User {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: Profile;
}

export type Errors = Record<string, string[]>;

export interface ArticleListData {
  articles: Article[];
  pages: number;
}

export const avatar = (image: string | null) => image || '/default-avatar.svg';

export const formatDate = (date: string) => new Date(date).toDateString();
