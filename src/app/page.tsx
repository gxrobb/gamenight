import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Link,
} from '@chakra-ui/react';
import { env } from '@/lib/env';

export default function Home() {
  return (
    <Box minH="100vh" p={8}>
      <Container maxW="container.xl" centerContent>
        <VStack gap={8} align="center">
          <Heading as="h1" size="2xl" textAlign="center">
            Welcome to {env.NEXT_PUBLIC_APP_NAME}
          </Heading>

          <Text fontSize="lg" textAlign="center" maxW="600px">
            This is a Next.js application with TypeScript, ESLint, Prettier,
            Chakra UI, Jest, and environment variables configured.
          </Text>

          <VStack gap={4} align="stretch" w="full" maxW="400px">
            <Text fontSize="sm" color="gray.600">
              Get started by editing{' '}
              <Box
                as="code"
                bg="gray.100"
                px={2}
                py={1}
                rounded="md"
                display="inline"
              >
                src/app/page.tsx
              </Box>
            </Text>

            <Text fontSize="sm" color="gray.600">
              Save and see your changes instantly.
            </Text>
          </VStack>

          <HStack gap={4} wrap="wrap" justify="center">
            <Button asChild colorPalette="blue" size="lg">
              <a
                href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Deploy now
              </a>
            </Button>

            <Button asChild variant="outline" size="lg">
              <a
                href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read our docs
              </a>
            </Button>
          </HStack>

          <HStack gap={6} wrap="wrap" justify="center" mt={8}>
            <Link
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              color="blue.500"
              _hover={{ textDecoration: 'underline' }}
            >
              Learn
            </Link>

            <Link
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              color="blue.500"
              _hover={{ textDecoration: 'underline' }}
            >
              Examples
            </Link>

            <Link
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              color="blue.500"
              _hover={{ textDecoration: 'underline' }}
            >
              Go to nextjs.org →
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
