import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '@/components/auth/SignUpForm';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
    },
  })),
}));

import { createClient } from '@/lib/supabase/client';

const mockCreateClient = createClient as jest.Mock;

describe('SignUpForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ error: null }),
      },
    });
  });

  it('should render the sign up form', () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should show validation error for weak password', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password');
    await user.type(screen.getByLabelText(/confirm password/i), 'password');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/uppercase letter.*lowercase letter.*number/i)).toBeInTheDocument();
    });
  });

  it('should call Supabase signUp and onSuccess on valid submission', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: null });
    mockCreateClient.mockReturnValue({
      auth: { signUp: mockSignUp },
    });

    const user = userEvent.setup();
    render(<SignUpForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display server error when sign up fails', async () => {
    const mockSignUp = jest
      .fn()
      .mockResolvedValue({ error: { message: 'Email already registered' } });
    mockCreateClient.mockReturnValue({
      auth: { signUp: mockSignUp },
    });

    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('should render switch to login link when callback provided', () => {
    render(<SignUpForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should call onSwitchToLogin when sign in link is clicked', async () => {
    const user = userEvent.setup();
    render(<SignUpForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});
