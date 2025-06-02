import { Metadata } from 'next';

export interface PageProps {
  params: { [key: string]: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export interface GenerateMetadataProps {
  params: { [key: string]: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export interface UsernamePageProps {
  params: {
    username: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
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