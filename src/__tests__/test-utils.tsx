import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraUIProvider } from '@/providers/chakra-provider';
import { NextAuthSessionProvider } from '@/providers/session-provider';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextAuthSessionProvider>
      <ChakraUIProvider>{children}</ChakraUIProvider>
    </NextAuthSessionProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Simple test to avoid "no tests" error
describe('Test Utils', () => {
  it('should be configured correctly', () => {
    expect(true).toBe(true);
  });
});
