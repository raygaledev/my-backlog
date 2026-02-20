'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import type { AuthMode } from '@/types/auth';

interface AuthModalContentProps {
  initialMode: AuthMode;
  onSuccess: () => void;
}

function AuthModalContent({ initialMode, onSuccess }: AuthModalContentProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const title = mode === 'login' ? 'Welcome Back' : 'Create Account';

  return (
    <>
      <h2 className="text-xl font-semibold text-zinc-100 mb-6">{title}</h2>
      {mode === 'login' ? (
        <LoginForm onSuccess={onSuccess} onSwitchToSignUp={() => setMode('signup')} />
      ) : (
        <SignUpForm onSuccess={onSuccess} onSwitchToLogin={() => setMode('login')} />
      )}
    </>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const handleSuccess = () => {
    onClose();
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <AuthModalContent key={initialMode} initialMode={initialMode} onSuccess={handleSuccess} />
      )}
    </Modal>
  );
}
