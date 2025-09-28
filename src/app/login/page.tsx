'use client';
import {Box, Container, Center} from '@chakra-ui/react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const handleLogin = (data: {username: string; password: string}) => {
    // Handle login logic here
    console.log('Login successful:', data);
    // You can redirect to dashboard or handle authentication here
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="container.sm">
        <Center>
          <LoginForm onSubmit={handleLogin} />
        </Center>
      </Container>
    </Box>
  );
}
