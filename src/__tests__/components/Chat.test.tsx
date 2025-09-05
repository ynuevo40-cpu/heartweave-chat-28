import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@/test/testUtils';
import { render, mockUser } from '@/test/testUtils';
import Chat from '@/pages/Chat';

// Mock the useChat hook
vi.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [],
    loading: false,
    sendMessage: vi.fn(),
    giveHeart: vi.fn()
  })
}));

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: vi.fn()
  })
}));

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat interface', () => {
    render(<Chat />);
    
    expect(screen.getByPlaceholderText('Escribe tu mensaje...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('should allow typing in message input', () => {
    render(<Chat />);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    expect(input).toHaveValue('Test message');
  });

  it('should display empty state when no messages', () => {
    render(<Chat />);
    
    expect(screen.getByText('¡Sé el primero en escribir un mensaje!')).toBeInTheDocument();
  });
});