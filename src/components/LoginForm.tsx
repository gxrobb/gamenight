'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  Field,
} from '@chakra-ui/react';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { useState } from 'react';

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use NextAuth.js signIn
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else if (result?.ok) {
        // Call the onSubmit prop if provided
        if (onSubmit) {
          onSubmit(data);
        }
        // Always redirect to dashboard on successful login
        router.push('/dashboard');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="lg" mx="auto" p={8} bg="white" borderRadius="lg" boxShadow="lg">
      <VStack gap={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg">Welcome Back</Heading>
          <Text mt={2}>Sign in to your account</Text>
        </Box>

        {error && (
          <Alert.Root>
            <Alert.Content>{error}</Alert.Content>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <VStack gap={4} align="stretch">
            <Field.Root invalid={!!errors.username}>
              <Field.Label htmlFor="username">Username</Field.Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                disabled={isLoading}
                {...register('username')}
              />
              <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label htmlFor="password">Password</Field.Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                {...register('password')}
              />
              <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
            </Field.Root>

            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              loadingText="Signing in..."
              disabled={isLoading}
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
