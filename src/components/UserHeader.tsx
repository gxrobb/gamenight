'use client';

import {
  Box,
  HStack,
  Text, 
  VStack,
  Heading,
  Badge,
  Avatar,
  IconButton,
  Collapsible,
} from '@chakra-ui/react';
import { useState } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      {/* Main Header Row */}
      <HStack justify="space-between" align="center" px={6} py={4}>
        <HStack gap={4}>
          <Heading size="md" color="gray.800">
            GameNight
          </Heading>
        </HStack>
        
        {/* Desktop User Info - Hidden on medium screens and below */}
        <Box display={{ base: "none", md: "block" }}>
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
        </Box>

        {/* Mobile Hamburger Menu - Shown on medium screens and below */}
        <Box display={{ base: "block", md: "none" }}>
          <IconButton
            aria-label="Toggle user menu"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "✕" : "☰"}
          </IconButton>
        </Box>
      </HStack>

      {/* Expandable Mobile User Info */}
      <Collapsible.Root open={isExpanded} onOpenChange={(details) => setIsExpanded(details.open)}>
        <Collapsible.Content>
          <Box 
            display={{ base: "block", md: "none" }} 
            px={6} 
            pb={4}
            borderTop="1px" 
            borderColor="gray.100"
          >
            <HStack justify="space-between" align="center" py={3}>
              <HStack gap={3}>
                <Avatar.Root size="sm">
                  <Avatar.Fallback bg="blue.500" color="white">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                    {user.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.email}
                  </Text>
                </VStack>
              </HStack>
              
              <Badge 
                colorPalette={user.isLoggedIn ? "green" : "red"} 
                variant="subtle"
              >
                {user.isLoggedIn ? "Online" : "Offline"}
              </Badge>
            </HStack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
