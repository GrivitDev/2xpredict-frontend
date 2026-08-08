export interface Article {
  _id: string;

  title: string;

  slug: string;

  content: string;

  excerpt: string;

  featuredImage?: string;

  createdAt: string;
}