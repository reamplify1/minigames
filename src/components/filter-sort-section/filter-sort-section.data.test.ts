import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchJsonMock } = vi.hoisted(() => ({ fetchJsonMock: vi.fn() }));

vi.mock('../../utils/api', () => ({ fetchJson: fetchJsonMock }));

import { fetchFilterChips } from './filter-sort-section.data';

describe('fetchFilterChips', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  it('requests the categories endpoint', async () => {
    fetchJsonMock.mockResolvedValue({ data: [] });

    await fetchFilterChips();

    expect(fetchJsonMock).toHaveBeenCalledWith('/categories');
  });

  it('maps each category slug to a chip id', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        { slug: 'all', label: 'All', isDefault: true },
        { slug: 'puzzle', label: 'Puzzle', isDefault: false },
      ],
    });

    const chips = await fetchFilterChips();

    expect(chips).toEqual([
      { id: 'all', label: 'All', isDefault: true },
      { id: 'puzzle', label: 'Puzzle', isDefault: false },
    ]);
  });

  it('passes a request error on to the caller', async () => {
    fetchJsonMock.mockRejectedValue(new Error('Network error'));

    await expect(fetchFilterChips()).rejects.toThrow('Network error');
  });
});
