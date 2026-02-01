import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from '@/components/games/GameCard';
import type { GameItem } from '@/hooks/useGamesPage';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    alt,
    fill,
    ...props
  }: {
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} data-fill={fill ? 'true' : undefined} {...props} />;
  },
}));

const createGame = (overrides: Partial<GameItem> = {}): GameItem => ({
  app_id: 123,
  name: 'Test Game',
  playtime_forever: 120,
  steam_review_score: 85,
  steam_review_count: 1000,
  steam_review_weighted: 82,
  header_image: 'https://example.com/image.jpg',
  main_story_hours: 10,
  status: null,
  ...overrides,
});

describe('GameCard', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render game name', () => {
      render(<GameCard game={createGame()} onStatusChange={mockOnStatusChange} />);

      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    it('should render game image when available', () => {
      render(<GameCard game={createGame()} onStatusChange={mockOnStatusChange} />);

      const img = screen.getByAltText('Test Game');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render placeholder when no image', () => {
      render(
        <GameCard
          game={createGame({ header_image: null })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByAltText('Test Game')).not.toBeInTheDocument();
    });

    it('should render main story hours', () => {
      render(<GameCard game={createGame()} onStatusChange={mockOnStatusChange} />);

      expect(screen.getByText('10h')).toBeInTheDocument();
    });

    it('should render steam review score', () => {
      render(<GameCard game={createGame()} onStatusChange={mockOnStatusChange} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should render playtime', () => {
      render(<GameCard game={createGame()} onStatusChange={mockOnStatusChange} />);

      expect(screen.getByText('2h played')).toBeInTheDocument();
    });

    it('should not render playtime when zero', () => {
      render(
        <GameCard
          game={createGame({ playtime_forever: 0 })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByText(/played/)).not.toBeInTheDocument();
    });
  });

  describe('status badges', () => {
    it('should show Finished badge for finished games', () => {
      render(
        <GameCard
          game={createGame({ status: 'finished' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Finished')).toBeInTheDocument();
    });

    it('should show Dropped badge for dropped games', () => {
      render(
        <GameCard
          game={createGame({ status: 'dropped' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Dropped')).toBeInTheDocument();
    });

    it('should show Hidden badge for hidden games', () => {
      render(
        <GameCard
          game={createGame({ status: 'hidden' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Hidden')).toBeInTheDocument();
    });

    it('should not show badge for backlog games', () => {
      render(
        <GameCard
          game={createGame({ status: 'backlog' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByText('Finished')).not.toBeInTheDocument();
      expect(screen.queryByText('Dropped')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });
  });

  describe('backlog actions', () => {
    it('should show Finish, Drop, Hide buttons for backlog games', () => {
      render(
        <GameCard
          game={createGame({ status: null })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Finish')).toBeInTheDocument();
      expect(screen.getByText('Drop')).toBeInTheDocument();
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });

    it('should call onStatusChange with finished when Finish clicked', () => {
      render(
        <GameCard
          game={createGame({ status: null })}
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByText('Finish'));

      expect(mockOnStatusChange).toHaveBeenCalledWith(123, 'finished');
    });

    it('should call onStatusChange with dropped when Drop clicked', () => {
      render(
        <GameCard
          game={createGame({ status: null })}
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByText('Drop'));

      expect(mockOnStatusChange).toHaveBeenCalledWith(123, 'dropped');
    });

    it('should call onStatusChange with hidden when Hide clicked', () => {
      render(
        <GameCard
          game={createGame({ status: null })}
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByText('Hide'));

      expect(mockOnStatusChange).toHaveBeenCalledWith(123, 'hidden');
    });
  });

  describe('restore actions', () => {
    it('should show Move to Backlog for finished games', () => {
      render(
        <GameCard
          game={createGame({ status: 'finished' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Move to Backlog')).toBeInTheDocument();
    });

    it('should show Move to Backlog for dropped games', () => {
      render(
        <GameCard
          game={createGame({ status: 'dropped' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Move to Backlog')).toBeInTheDocument();
    });

    it('should show Unhide for hidden games', () => {
      render(
        <GameCard
          game={createGame({ status: 'hidden' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Unhide')).toBeInTheDocument();
    });

    it('should call onStatusChange with backlog when restore clicked', () => {
      render(
        <GameCard
          game={createGame({ status: 'finished' })}
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByText('Move to Backlog'));

      expect(mockOnStatusChange).toHaveBeenCalledWith(123, 'backlog');
    });
  });
});
