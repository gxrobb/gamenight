import React from 'react';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRouter} from 'next/navigation';
import {render} from '../../__tests__/test-utils';
import {mockPush, mockSignOut} from '../../__tests__/setup';
import {UserSession} from '@/types/user';
import UserHeader from '../UserHeader';

// Mock useRouter to return our mock
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

describe('UserHeader', () => {
  const mockUser: UserSession = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    isLoggedIn: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  describe('Desktop View', () => {
    it('should display user information correctly', () => {
      render(<UserHeader user={mockUser} />);

      expect(screen.getByText('GameNight')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('desktop-user-email')).toHaveTextContent(
        'test@example.com'
      );
      // Check that both desktop and mobile show online status
      const onlineBadges = screen.getAllByText('Online');
      expect(onlineBadges).toHaveLength(2); // Desktop and mobile views
      // Check that both desktop and mobile avatars show the first letter
      const avatarInitials = screen.getAllByText('T');
      expect(avatarInitials).toHaveLength(2); // Desktop and mobile views
    });

    it('should show offline status when user is not logged in', () => {
      const offlineUser = {...mockUser, isLoggedIn: false};
      render(<UserHeader user={offlineUser} />);

      // Check that both desktop and mobile show offline status
      const offlineBadges = screen.getAllByText('Offline');
      expect(offlineBadges).toHaveLength(2); // Desktop and mobile views
    });

    it('should call signOut and redirect on logout button click', async () => {
      const user = userEvent.setup();
      render(<UserHeader user={mockUser} />);

      const logoutButton = screen.getByTestId('desktop-logout-button');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          callbackUrl: '/login',
          redirect: true,
        });
      });
    });
  });

  describe('Mobile View', () => {
    // Mock window.matchMedia for responsive behavior
    const mockMatchMedia = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    beforeEach(() => {
      // Mock mobile view (below md breakpoint)
      mockMatchMedia.mockReturnValue({
        matches: true, // Mobile view
        media: '(max-width: 767px)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });
    });

    it('should show hamburger menu on mobile', () => {
      render(<UserHeader user={mockUser} />);

      expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
      expect(screen.getByText('☰')).toBeInTheDocument();
    });

    it('should expand menu when hamburger is clicked', async () => {
      const user = userEvent.setup();
      render(<UserHeader user={mockUser} />);

      const hamburgerButton = screen.getByTestId('mobile-menu-toggle');
      await user.click(hamburgerButton);

      // Should show expanded content
      expect(screen.getByTestId('mobile-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('mobile-user-email')).toHaveTextContent(
        'test@example.com'
      );
      // Check that both desktop and mobile show online status
      const onlineBadges = screen.getAllByText('Online');
      expect(onlineBadges).toHaveLength(2); // Desktop and mobile views
      // Check that both desktop and mobile avatars show the first letter
      const avatarInitials = screen.getAllByText('T');
      expect(avatarInitials).toHaveLength(2); // Desktop and mobile views
    });

    it('should show close icon when menu is expanded', async () => {
      const user = userEvent.setup();
      render(<UserHeader user={mockUser} />);

      const hamburgerButton = screen.getByTestId('mobile-menu-toggle');
      await user.click(hamburgerButton);

      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('should call signOut when logout is clicked in mobile menu', async () => {
      const user = userEvent.setup();
      render(<UserHeader user={mockUser} />);

      // Open mobile menu
      const hamburgerButton = screen.getByTestId('mobile-menu-toggle');
      await user.click(hamburgerButton);

      // Click logout in mobile menu
      const logoutButton = screen.getByTestId('mobile-logout-button');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          callbackUrl: '/login',
          redirect: true,
        });
      });
    });

    it('should toggle menu when hamburger is clicked multiple times', async () => {
      const user = userEvent.setup();
      render(<UserHeader user={mockUser} />);

      const hamburgerButton = screen.getByTestId('mobile-menu-toggle');

      // First click - should expand
      await user.click(hamburgerButton);
      expect(screen.getByText('✕')).toBeInTheDocument();

      // Second click - should collapse
      await user.click(hamburgerButton);
      expect(screen.getByText('☰')).toBeInTheDocument();
    });
  });

  describe('Avatar Display', () => {
    it('should show first letter of name in avatar', () => {
      render(<UserHeader user={mockUser} />);

      // Check that both desktop and mobile avatars show the first letter
      const avatarInitials = screen.getAllByText('T');
      expect(avatarInitials).toHaveLength(2); // Desktop and mobile views
    });

    it('should show first letter of single name', () => {
      const singleNameUser = {...mockUser, username: 'john'};
      render(<UserHeader user={singleNameUser} />);

      // Check that both desktop and mobile avatars show the first letter
      const avatarInitials = screen.getAllByText('J');
      expect(avatarInitials).toHaveLength(2); // Desktop and mobile views
    });

    it('should handle empty name gracefully', () => {
      const emptyNameUser = {...mockUser, username: ''};
      render(<UserHeader user={emptyNameUser} />);

      // Should not crash and should show some fallback
      expect(screen.getByText('GameNight')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should show both desktop and mobile user info elements', () => {
      render(<UserHeader user={mockUser} />);

      // Both desktop and mobile user info should be in the DOM
      // (CSS handles the visual hiding/showing based on screen size)
      expect(screen.getByTestId('desktop-user-info')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-user-info')).toBeInTheDocument();

      // Both should have the same user information
      expect(screen.getByTestId('desktop-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('mobile-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('desktop-user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('mobile-user-email')).toHaveTextContent(
        'test@example.com'
      );
    });
  });
});
