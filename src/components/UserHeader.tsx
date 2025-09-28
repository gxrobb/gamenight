'use client';

import {
  Box,
  HStack,
  Text, 
  VStack,
  Heading,
  Badge,
  Avatar,
} from '@chakra-ui/react';

interface User {
  id: number;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

interface UserHeaderProps {
  user: User;
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
      <HStack justify="space-between" align="center">
        <HStack gap={4}>
          <Heading size="md" color="gray.800">
            GameNight
          </Heading>
        </HStack>
        
        <HStack gap={4}>
          <VStack align="end" gap={0}>
            <Text fontSize="sm" fontWeight="medium" color="gray.800">
              {user.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {user.email}
            </Text>
          </VStack>
          
          <Avatar.Root size="sm">
            <Avatar.Fallback bg="blue.500" color="white">
              {user.name.charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          
          <Badge 
            colorPalette={user.isLoggedIn ? "green" : "red"} 
            variant="subtle"
          >
            {user.isLoggedIn ? "Online" : "Offline"}
          </Badge>
        </HStack>
      </HStack>
    </Box>
  );
}
