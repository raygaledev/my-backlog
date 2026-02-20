'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface GameStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, notes: string, rating: number | null) => void;
  action: 'finished' | 'dropped';
  gameName: string;
  initialDate?: string;
  initialNotes?: string;
  initialRating?: number | null;
}

export function GameStatusModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  gameName,
  initialDate,
  initialNotes,
  initialRating,
}: GameStatusModalProps) {
  const isEditMode = !!initialDate;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(initialDate ?? today);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [rating, setRating] = useState<string>(initialRating != null ? String(initialRating) : '');

  const title = action === 'finished' ? `Finished ${gameName}` : `Dropped ${gameName}`;
  const confirmLabel = isEditMode
    ? 'Save'
    : action === 'finished'
      ? 'Mark as Finished'
      : 'Mark as Dropped';

  function handleConfirm() {
    const parsedRating = rating !== '' ? parseInt(rating, 10) : null;
    onConfirm(date, notes, parsedRating);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1" htmlFor="status-date">
            Date
          </label>
          <input
            id="status-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1" htmlFor="status-rating">
            Your rating (0–10)
          </label>
          <input
            id="status-rating"
            type="number"
            min={0}
            max={10}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Leave blank if unrated"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1" htmlFor="status-notes">
            Notes
          </label>
          <textarea
            id="status-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts?"
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleConfirm}
            className="cursor-pointer flex-1 py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
