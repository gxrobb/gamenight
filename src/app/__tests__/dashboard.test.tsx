/// <reference types="jest" />
import React from 'react';
import {screen, waitFor} from '@testing-library/react';
import {render} from '../../__tests__/test-utils';
import {mockPush, mockUseSession} from '../../__tests__/setup';
import DashboardPage from '../dashboard/page';

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication States', () => {
    it('should redirect to login when unauthenticated', async () => {
      (mockUseSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should show loading state when session is loading', () => {
      (mockUseSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('loading-text')).toBeInTheDocument();
    });

    it('should render dashboard when authenticated', async () => {
      const mockSession = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
        },
        expires: '2024-12-31',
      };

      (mockUseSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('welcome-heading')).toBeInTheDocument();
      });

      expect(screen.getByTestId('desktop-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('desktop-user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('quick-actions-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('quick-actions-user-email')).toHaveTextContent(
        'test@example.com'
      );
    });

    it('should render nothing when no session user', () => {
      (mockUseSession as jest.Mock).mockReturnValue({
        data: {user: null, expires: '2024-12-31'},
        status: 'authenticated',
        update: jest.fn(),
      });

      const {container} = render(<DashboardPage />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('User Data Display', () => {
    it('should display user information from session', async () => {
      const mockSession = {
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
        },
        expires: '2024-12-31',
      };

      (mockUseSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('desktop-user-name')).toHaveTextContent(
          'testuser'
        );
      });

      expect(screen.getByTestId('desktop-user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('quick-actions-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('quick-actions-user-email')).toHaveTextContent(
        'test@example.com'
      );
    });

    it('should handle missing user name gracefully', async () => {
      const mockSession = {
        user: {
          id: '123',
          name: null,
          email: 'test@example.com',
          username: 'testuser',
        },
        expires: '2024-12-31',
      };

      (mockUseSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('desktop-user-name')).toHaveTextContent(
          'testuser'
        );
      });

      expect(screen.getByTestId('desktop-user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('quick-actions-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('quick-actions-user-email')).toHaveTextContent(
        'test@example.com'
      );
    });

    it('should handle missing user email gracefully', async () => {
      const mockSession = {
        user: {
          id: '123',
          name: 'Test User',
          email: null,
          username: 'testuser',
        },
        expires: '2024-12-31',
      };

      (mockUseSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('desktop-user-name')).toHaveTextContent(
          'testuser'
        );
      });

      expect(screen.getByTestId('desktop-user-email')).toHaveTextContent(
        'test@example.com'
      ); // From mock
      expect(screen.getByTestId('quick-actions-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('quick-actions-user-email')).toHaveTextContent(
        'test@example.com'
      );
    });
  });

  describe('Dashboard Content', () => {
    beforeEach(() => {
      const mockSession = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
        },
        expires: '2024-12-31',
      };

      (mockUseSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('should display welcome message', async () => {
      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('welcome-heading')).toBeInTheDocument();
      });

      expect(screen.getByTestId('welcome-description')).toBeInTheDocument();
    });

    it('should display quick actions section', async () => {
      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('quick-actions-section')).toBeInTheDocument();
      });

      expect(screen.getByTestId('quick-actions-heading')).toBeInTheDocument();
    });

    it('should display current user info in quick actions', async () => {
      render(<DashboardPage />);

      // Wait for the user data to load
      await waitFor(() => {
        expect(screen.getByTestId('user-info-text')).toBeInTheDocument();
      });

      expect(screen.getByTestId('quick-actions-user-name')).toHaveTextContent(
        'testuser'
      );
      expect(screen.getByTestId('quick-actions-user-email')).toHaveTextContent(
        'test@example.com'
      );
    });
  });

  describe('Redirect Behavior', () => {
    it('should not redirect when authenticated', () => {
      const mockSession = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
        },
        expires: '2024-12-31',
      };

      (mockUseSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect immediately when unauthenticated', async () => {
      (mockUseSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});
