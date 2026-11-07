import { Injectable, signal } from '@angular/core';

export type SnackbarVariant = 'success' | 'error';

export interface SnackbarMessage {
  id: number;
  text: string;
  variant: SnackbarVariant;
}

const AUTO_DISMISS_MS: number = 4000;

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  readonly messages = signal<SnackbarMessage[]>([]);
  private nextId: number = 0;

  show(text: string, variant: SnackbarVariant): void {
    const id = this.nextId++;

    this.messages.update((messages: SnackbarMessage[]): SnackbarMessage[] => [
      ...messages,
      { id, text, variant },
    ]);
    setTimeout((): void => {
      this.dismiss(id);
    }, AUTO_DISMISS_MS);
  }

  dismiss(id: number): void {
    this.messages.update((messages: SnackbarMessage[]): SnackbarMessage[] =>
      messages.filter((message: SnackbarMessage): boolean => message.id !== id)
    );
  }
}
