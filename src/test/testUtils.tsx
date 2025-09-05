import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

// Mock user for testing
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {}
};

// Mock message
export const mockMessage = {
  id: 'msg-123',
  user_id: 'test-user-123',
  content: 'Test message content',
  created_at: '2024-01-01T00:00:00.000Z',
  profile: {
    username: 'testuser',
    avatar_url: null,
    hearts_count: 5
  },
  equipped_banners: []
};

// All the providers that wrap our app
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, screen, fireEvent, waitFor };