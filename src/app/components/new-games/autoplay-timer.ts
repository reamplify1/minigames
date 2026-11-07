export class AutoplayTimer {
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private startedAt: number = 0;
  private timeLeft: number;

  constructor(
    private readonly delay: number,
    private readonly onTick: () => void
  ) {
    this.timeLeft = delay;
  }

  restart(): void {
    this.startTimer(this.delay);
  }

  pause(): void {
    if (this.timerId === undefined) {
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.timeLeft = Math.max(this.timeLeft - (performance.now() - this.startedAt), 0);
  }

  resume(): void {
    if (this.timerId === undefined) {
      this.startTimer(this.timeLeft);
    }
  }

  stop(): void {
    clearTimeout(this.timerId);
    this.timerId = undefined;
  }

  private startTimer(delay: number): void {
    clearTimeout(this.timerId);
    this.timeLeft = delay;
    this.startedAt = performance.now();
    this.timerId = setTimeout((): void => {
      this.timerId = undefined;
      this.onTick();
    }, delay);
  }
}
