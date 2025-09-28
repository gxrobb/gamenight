'use client';

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Spinner,
} from '@chakra-ui/react';
import UserHeader from '@/components/UserHeader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { userData, loading: userLoading, error: userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || userLoading) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="lg" />
          <Text data-testid="loading-text">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (userError) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          p={6}
          maxW="md"
        >
          <Text color="red.600" fontWeight="medium">
            Error loading user data: {userError}
          </Text>
        </Box>
      </Box>
    );
  }

  // Use session data as fallback if userData is not available yet
  const user = userData
    ? {
        id: userData.id,
        name: userData.username,
        email: userData.email,
        username: userData.username,
        isLoggedIn: true,
      }
    : {
        id: (session.user as { id?: string }).id || '1',
        name: session.user.name || 'User',
        email: session.user.email || '',
        username: (session.user as { username?: string }).username || '',
        isLoggedIn: true,
      };

  return (
    <Box minH="100vh" bg="gray.50">
      <UserHeader user={user} />

      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={4} data-testid="welcome-heading">
              Welcome to GameNight!
            </Heading>
            <Text
              fontSize="lg"
              maxW="600px"
              mx="auto"
              data-testid="welcome-description"
            >
              Your ultimate destination for organizing and managing game nights
              with friends and family.
            </Text>
          </Box>

          <Box
            bg="white"
            p={8}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            data-testid="quick-actions-section"
          >
            <VStack gap={6} align="stretch">
              <Heading size="lg" data-testid="quick-actions-heading">
                Quick Actions
              </Heading>

              <VStack gap={4} align="stretch">
                <Text
                  fontSize="sm"
                  textAlign="center"
                  data-testid="user-info-text"
                >
                  Currently logged in as:{' '}
                  <strong data-testid="quick-actions-user-name">
                    {user.username}
                  </strong>{' '}
                  (
                  <span data-testid="quick-actions-user-email">
                    {user.email}
                  </span>
                  )
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
