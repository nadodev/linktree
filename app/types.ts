export type PageProps<T = Record<string, string>> = {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export type UsernameParams = {
  username: string;
};

export type UsernamePageProps = {
  params: {
    username: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}; 