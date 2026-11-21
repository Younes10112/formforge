import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3"
          [class]="getToastClasses(toast.type)"
        >
          <div class="mt-0.5">
            <app-icon [name]="getToastIcon(toast.type)" [size]="18" />
          </div>
          <div class="flex-1 text-sm">
            @if (toast.title) {
              <div class="font-semibold tracking-tight">{{ toast.title }}</div>
            }
            <div class="text-xs opacity-90 leading-relaxed">{{ toast.message }}</div>
          </div>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  getToastClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-200';
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check';
      case 'error':
        return 'x';
      case 'warning':
        return 'settings';
      case 'info':
      default:
        return 'file-text';
    }
  }
}
