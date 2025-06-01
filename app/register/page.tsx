import { Metadata } from 'next';
import RegisterForm from '@/app/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | Linktree Clone',
  description: 'Create your Linktree Clone account',
};

export default function RegisterPage() {
  return <RegisterForm />;
} 