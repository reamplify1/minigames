import { AutoplayTimer } from './autoplay-timer';

describe('AutoplayTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks after the delay', () => {
    const onTick = vi.fn();
    new AutoplayTimer(4000, onTick).restart();

    vi.advanceTimersByTime(3999);
    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledOnce();
  });

  it('continues from the remembered time after a pause', () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(4000, onTick);

    timer.restart();
    vi.advanceTimersByTime(3000);
    timer.pause();
    vi.advanceTimersByTime(10_000);
    expect(onTick).not.toHaveBeenCalled();

    timer.resume();
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledOnce();
  });

  it('never ticks after stop', () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(4000, onTick);

    timer.restart();
    timer.stop();
    vi.advanceTimersByTime(10_000);

    expect(onTick).not.toHaveBeenCalled();
  });
});
