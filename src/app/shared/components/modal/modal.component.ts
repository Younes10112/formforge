import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          (click)="closeModal()"
        ></div>

        <!-- Dialog Window -->
        <div
          class="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all sm:p-7 dark:border-gray-800 dark:bg-gray-900"
          [class]="customWidthClass()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              (click)="closeModal()"
              class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <app-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Body Content -->
          <div class="py-5 max-h-[75vh] overflow-y-auto pr-1">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Modal');
  subtitle = input<string>('');
  customWidthClass = input<string>('');

  close = output<void>();

  closeModal(): void {
    this.close.emit();
  }
}
