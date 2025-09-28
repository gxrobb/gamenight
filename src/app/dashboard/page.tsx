import { Box, Container, VStack, Heading, Text, Button } from '@chakra-ui/react';
import UserHeader from '@/components/UserHeader';
import NextLink from 'next/link';

export default function DashboardPage() {
  const user = {
    id: 1,
    name: 'Test User',
    email: 'test@gmail.com',
    isLoggedIn: true
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <UserHeader user={user} />
      
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={4}>
              Welcome to GameNight!
            </Heading>
            <Text fontSize="lg" maxW="600px" mx="auto">
              Your ultimate destination for organizing and managing game nights with friends and family.
            </Text>
          </Box>

          <Box 
            bg="white" 
            p={8} 
            borderRadius="lg" 
            shadow="sm" 
            border="1px" 
            borderColor="gray.200"
          >
            <VStack gap={6} align="stretch">
              <Heading size="lg">
                Quick Actions
              </Heading>
              
              <VStack gap={4} align="stretch">
                <Text fontSize="sm" textAlign="center">
                  Currently logged in as: <strong>{user.name}</strong> ({user.email})
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
