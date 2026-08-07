import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div
      [class]="wrapperClass()"
      role="status"
      aria-live="polite"
      [attr.aria-label]="message() || 'Loading'"
    >
      <div class="rounded-full border-2 border-burgundy-200 border-t-burgundy-700 animate-spin" [class]="spinnerClass()"></div>
      @if (message() && !inline()) {
        <p class="text-sm text-gray-500 mt-3 text-center">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly message = input('');
  readonly inline = input(false);
  readonly centered = input(true);

  readonly spinnerClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  });

  readonly wrapperClass = computed(() => {
    if (this.inline()) return 'inline-flex items-center';
    if (this.centered()) return 'flex flex-col items-center justify-center py-12 px-4';
    return 'flex flex-col items-start';
  });
}
