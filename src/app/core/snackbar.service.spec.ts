import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a message and removes it after four seconds', () => {
    const service = new SnackbarService();

    service.show('Saved', 'success');
    expect(service.messages().map((message) => message.text)).toEqual(['Saved']);

    vi.advanceTimersByTime(4000);
    expect(service.messages()).toEqual([]);
  });

  it('removes only the dismissed message', () => {
    const service = new SnackbarService();

    service.show('First', 'success');
    service.show('Second', 'error');
    service.dismiss(service.messages()[0]?.id ?? -1);

    expect(service.messages().map((message) => message.text)).toEqual(['Second']);
  });
});
