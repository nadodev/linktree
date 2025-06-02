import { Metadata } from 'next';

export interface PageProps<T = { [key: string]: string }, S = { [key: string]: string | string[] | undefined }> {
  params: Promise<T>;
  searchParams?: Promise<S>;
}

export interface GenerateMetadataProps {
  params: { [key: string]: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export interface UsernamePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export interface UsernameMetadataProps {
  params: {
    username: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export type UsernameParams = {
  username: string;
};

export interface MetadataProps<T = { [key: string]: string }, S = { [key: string]: string | string[] | undefined }> {
  params: Promise<T>;
  searchParams?: Promise<S>;
} 