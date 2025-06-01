import { Metadata } from 'next';
import LoginForm from '@/app/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login | Linktree Clone',
  description: 'Login to your Linktree Clone account',
};

export default function LoginPage() {
  return <LoginForm />;
} 