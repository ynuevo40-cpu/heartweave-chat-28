import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/testUtils';
import { UserAvatar } from '@/components/UserAvatar';

describe('UserAvatar', () => {
  it('should render avatar with name initial when no src provided', () => {
    // Arrange
    const props = {
      name: 'TestUser',
      size: 'md' as const
    };

    // Act
    render(<UserAvatar {...props} />);

    // Assert
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('should render avatar image when src is provided', () => {
    // Arrange
    const props = {
      name: 'TestUser',
      src: 'https://example.com/avatar.jpg',
      size: 'md' as const
    };

    // Act
    render(<UserAvatar {...props} />);

    // Assert
    const avatarImage = screen.getByRole('img');
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatarImage).toHaveAttribute('alt', 'TestUser');
  });

  it('should handle single name gracefully', () => {
    // Arrange
    const props = {
      name: 'Test',
      size: 'md' as const
    };

    // Act
    render(<UserAvatar {...props} />);

    // Assert
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render correct size variants', () => {
    // Arrange & Act
    const { rerender } = render(
      <UserAvatar name="Test User" size="sm" />
    );

    // Assert small size
    expect(screen.getByRole('img')).toHaveClass('h-8', 'w-8');

    // Act - rerender with large size
    rerender(<UserAvatar name="Test User" size="lg" />);

    // Assert large size  
    expect(screen.getByRole('img')).toHaveClass('h-16', 'w-16');
  });

  it('should apply glow effect when showGlow is true', () => {
    // Arrange & Act
    render(<UserAvatar name="Test User" showGlow={true} />);

    // Assert
    expect(screen.getByRole('img')).toHaveClass('glow-primary');
  });
});