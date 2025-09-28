import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { render } from '../../__tests__/test-utils';
import { mockPush, mockSignIn } from '../../__tests__/setup';
import LoginForm from '../LoginForm';

// Mock useRouter to return our mock
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ ok: true, error: null });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for short username', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'ab'); // Less than 3 characters

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Username must be at least 3 characters')
        ).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, '12345'); // Less than 6 characters

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 6 characters')
        ).toBeInTheDocument();
      });
    });

    it('should show validation error for long username', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'a'.repeat(21)); // More than 20 characters

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Username must be less than 20 characters')
        ).toBeInTheDocument();
      });
    });

    it('should show validation error for long password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'a'.repeat(101)); // More than 100 characters

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be less than 100 characters')
        ).toBeInTheDocument();
      });
    });

    it('should not show validation errors for valid input', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Username is required')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Password is required')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Login Functionality', () => {
    it('should call signIn with correct credentials', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          username: 'testuser',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('should show error message when login fails', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid username or password')
        ).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: true, error: null });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockSignIn.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, error: null }), 100)
          )
      );

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should disable form during loading', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, error: null }), 100)
          )
      );

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Form should be disabled during loading
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('API Error Handling', () => {
    it('should show error message when API throws an error', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Login failed. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('should clear error message when user starts typing again', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid username or password')
        ).toBeInTheDocument();
      });

      // Start typing again
      await user.type(usernameInput, 'x');

      // Error should still be there (it only clears on new submit)
      expect(
        screen.getByText('Invalid username or password')
      ).toBeInTheDocument();
    });
  });

  describe('Custom onSubmit Handler', () => {
    it('should call custom onSubmit when provided', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      mockSignIn.mockResolvedValue({ ok: true, error: null });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
