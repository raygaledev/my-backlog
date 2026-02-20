import { render, screen, fireEvent } from '@testing-library/react';
import { GamesSort } from '@/components/games/GamesSort';

describe('GamesSort', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the trigger with the current sort label', () => {
      render(<GamesSort value="playtime" onChange={mockOnChange} />);

      expect(screen.getByText('Most Played')).toBeInTheDocument();
    });

    it('should show all options when opened', () => {
      render(<GamesSort value="playtime" onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Most Played/i }));

      expect(screen.getAllByText('Most Played').length).toBeGreaterThan(0);
      expect(screen.getByText('Highest Rated')).toBeInTheDocument();
      expect(screen.getByText('Most Recent')).toBeInTheDocument();
    });

    it('should display selected sort option in trigger', () => {
      render(<GamesSort value="score" onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /Highest Rated/i })).toBeInTheDocument();
    });

    it('should mark the active option as selected', () => {
      render(<GamesSort value="recent" onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Most Recent/i }));

      const selectedOption = screen.getByRole('option', { name: /Most Recent/i });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('interactions', () => {
    it('should call onChange when selecting Most Played', () => {
      render(<GamesSort value="score" onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Highest Rated/i }));
      fireEvent.click(screen.getByRole('option', { name: /Most Played/i }).querySelector('button')!);

      expect(mockOnChange).toHaveBeenCalledWith('playtime');
    });

    it('should call onChange when selecting Highest Rated', () => {
      render(<GamesSort value="playtime" onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Most Played/i }));
      fireEvent.click(screen.getByRole('option', { name: /Highest Rated/i }).querySelector('button')!);

      expect(mockOnChange).toHaveBeenCalledWith('score');
    });

    it('should call onChange when selecting Most Recent', () => {
      render(<GamesSort value="playtime" onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Most Played/i }));
      fireEvent.click(screen.getByRole('option', { name: /Most Recent/i }).querySelector('button')!);

      expect(mockOnChange).toHaveBeenCalledWith('recent');
    });

    it('should close the dropdown after selecting an option', () => {
      render(<GamesSort value="playtime" onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Most Played/i }));
      fireEvent.click(screen.getByRole('option', { name: /Most Recent/i }).querySelector('button')!);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
