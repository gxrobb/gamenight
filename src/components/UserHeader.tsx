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
  Button,
} from '@chakra-ui/react';
import {useState} from 'react';
import {signOut} from 'next-auth/react';
import {UserSession} from '@/types/user';

interface UserHeaderProps {
  user: UserSession;
}

export default function UserHeader({user}: UserHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
      redirect: true,
    });
  };

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      {/* Main Header Row */}
      <HStack justify="space-between" align="center" px={6} py={4}>
        <HStack gap={4}>
          <Heading size="md">GameNight</Heading>
        </HStack>

        {/* Desktop User Info - Hidden on medium screens and below */}
        <Box
          display={{base: 'none', md: 'block'}}
          data-testid="desktop-user-info"
        >
          <HStack gap={4}>
            <VStack align="end" gap={0}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                data-testid="desktop-user-name"
              >
                {user.username || 'User'}
              </Text>
              <Text fontSize="xs" data-testid="desktop-user-email">
                {user.email}
              </Text>
            </VStack>

            <Avatar.Root size="sm">
              <Avatar.Fallback>
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar.Fallback>
            </Avatar.Root>

            <Badge variant="subtle">
              {user.isLoggedIn ? 'Online' : 'Offline'}
            </Badge>

            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              data-testid="desktop-logout-button"
            >
              Logout
            </Button>
          </HStack>
        </Box>

        {/* Mobile Hamburger Menu - Shown on medium screens and below */}
        <Box display={{base: 'block', md: 'none'}}>
          <IconButton
            aria-label="Toggle user menu"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="mobile-menu-toggle"
          >
            {isExpanded ? '✕' : '☰'}
          </IconButton>
        </Box>
      </HStack>

      {/* Expandable Mobile User Info */}
      <Collapsible.Root
        open={isExpanded}
        onOpenChange={(details) => setIsExpanded(details.open)}
      >
        <Collapsible.Content>
          <Box
            display={{base: 'block', md: 'none'}}
            px={6}
            pb={4}
            borderTop="1px"
            borderColor="gray.100"
            data-testid="mobile-user-info"
          >
            <HStack justify="space-between" align="center" py={3}>
              <HStack gap={3}>
                <Avatar.Root size="sm">
                  <Avatar.Fallback>
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar.Fallback>
                </Avatar.Root>
                <VStack align="start" gap={0}>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    data-testid="mobile-user-name"
                  >
                    {user.username || 'User'}
                  </Text>
                  <Text fontSize="xs" data-testid="mobile-user-email">
                    {user.email}
                  </Text>
                </VStack>
              </HStack>

              <Badge variant="subtle">
                {user.isLoggedIn ? 'Online' : 'Offline'}
              </Badge>

              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                w="full"
                data-testid="mobile-logout-button"
              >
                Logout
              </Button>
            </HStack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
