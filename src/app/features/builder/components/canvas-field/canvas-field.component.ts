import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '../../../../core/models/form-config.model';
import { FormStateService } from '../../../../core/services/form-state.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-canvas-field',
  imports: [CdkDragHandle, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      (click)="onSelect($event)"
      class="group relative rounded-xl border bg-white p-3 sm:p-3.5 transition-all duration-150 select-none cursor-pointer dark:bg-gray-800/90"
      [class]="isSelected()
        ? 'border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20 dark:border-blue-500'
        : 'border-gray-200/90 hover:border-gray-300 hover:shadow-xs dark:border-gray-700/80 dark:hover:border-gray-600'"
      [class.opacity-60]="field().hidden"
    >
      <!-- Top Meta Bar: Drag Handle, Label, Badges, Actions -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <!-- Drag Handle -->
          <button
            type="button"
            cdkDragHandle
            class="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors shrink-0"
            title="Drag to reorder"
          >
            <app-icon name="grip-vertical" [size]="14" />
          </button>

          <!-- Field Label -->
          <span class="text-xs font-semibold text-gray-900 dark:text-white truncate">
            {{ field().label || 'Untitled Field' }}
          </span>

          @if (field().required) {
            <span class="text-rose-500 font-bold text-xs shrink-0" title="Required field">*</span>
          }

          <!-- Type Badge -->
          <span class="text-[9px] uppercase font-mono tracking-wider px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0">
            {{ field().type }}
          </span>

          <!-- Conditional Indicator Badge -->
          @if (field().conditionalLogic?.enabled) {
            <span class="text-[9px] font-medium px-1 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0 hidden sm:inline" title="Has conditional logic">
              Cond
            </span>
          }
        </div>

        <!-- Quick Toolbar on Hover / Selection -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" [class.opacity-100]="isSelected()">
          <span class="text-[9px] font-mono text-gray-400 mr-1 hidden md:inline">{{ field().name }}</span>

          <button
            type="button"
            (click)="onDuplicate($event)"
            title="Duplicate field"
            class="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
          >
            <app-icon name="copy" [size]="13" />
          </button>

          <button
            type="button"
            (click)="onDelete($event)"
            title="Delete field"
            class="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 transition-all"
          >
            <app-icon name="trash" [size]="13" />
          </button>
        </div>
      </div>

      <!-- Simulated Field Input Preview -->
      <div class="pointer-events-none opacity-80 text-xs">
        @if (isHorizontal()) {
          <!-- Horizontal Layout Preview (Label Left, Input Right) -->
          <div class="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-center gap-2">
            <span class="text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate">
              {{ field().label }}
            </span>
            <div>
              @switch (field().type) {
                @case ('textarea') {
                  <div class="w-full h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 text-[11px] text-gray-400">
                    {{ field().placeholder || 'Textarea...' }}
                  </div>
                }
                @case ('select') {
                  <div class="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 flex items-center justify-between text-[11px] text-gray-400">
                    <span class="truncate">{{ field().placeholder || 'Select...' }}</span>
                    <app-icon name="chevron-down" [size]="12" />
                  </div>
                }
                @case ('checkbox') {
                  <div class="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                    <div class="h-3.5 w-3.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"></div>
                    <span class="truncate">{{ field().label }}</span>
                  </div>
                }
                @case ('toggle') {
                  <div class="w-8 h-4.5 bg-gray-200 rounded-full dark:bg-gray-700 relative">
                    <div class="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 left-0.5"></div>
                  </div>
                }
                @default {
                  <div class="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 flex items-center text-[11px] text-gray-400 truncate">
                    {{ field().placeholder || 'Enter ' + field().label + '...' }}
                  </div>
                }
              }
            </div>
          </div>
        } @else {
          <!-- Vertical Layout Preview (Label Top, Input Bottom) -->
          @switch (field().type) {
            @case ('textarea') {
              <div class="w-full h-14 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 text-[11px] text-gray-400">
                {{ field().placeholder || 'Textarea preview...' }}
              </div>
            }
            @case ('select') {
              <div class="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 flex items-center justify-between text-[11px] text-gray-400">
                <span>{{ field().placeholder || 'Dropdown select...' }}</span>
                <app-icon name="chevron-down" [size]="12" />
              </div>
            }
            @case ('checkbox') {
              <div class="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                <div class="h-3.5 w-3.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"></div>
                <span>{{ field().label }}</span>
              </div>
            }
            @case ('toggle') {
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-gray-500">{{ field().label }}</span>
                <div class="w-8 h-4.5 bg-gray-200 rounded-full dark:bg-gray-700 relative">
                  <div class="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 left-0.5"></div>
                </div>
              </div>
            }
            @case ('heading') {
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200">
                {{ field().content || field().label }}
              </div>
            }
            @case ('paragraph') {
              <div class="text-[11px] text-gray-500 leading-relaxed">
                {{ field().content || field().label }}
              </div>
            }
            @case ('divider') {
              <hr class="border-gray-200 dark:border-gray-700" />
            }
            @default {
              <div class="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 flex items-center text-[11px] text-gray-400 wrap-anywhere">
                {{ field().placeholder || 'Enter ' + field().label + '...' }}
              </div>
            }
          }
        }
      </div>

      <!-- Field Width & Layout Pill -->
      <div class="mt-2 flex items-center justify-between text-[9px] text-gray-400 font-mono">
        <span class="capitalize">{{ field().appearance.width || 'full' }} • {{ isHorizontal() ? 'Horizontal' : 'Vertical' }}</span>
        @if (field().validators.length > 0) {
          <span>{{ field().validators.length }} validator(s)</span>
        }
      </div>
    </div>
  `
})
export class CanvasFieldComponent {
  private readonly formState = inject(FormStateService);

  field = input.required<FormField>();

  readonly isSelected = computed(() => {
    return this.formState.selectedFieldId() === this.field().id;
  });

  readonly isHorizontal = computed(() => {
    const pos = this.field().appearance?.labelPosition;
    if (pos && pos !== 'default') {
      return pos === 'left';
    }
    return this.formState.settings().layout === 'horizontal';
  });

  onSelect(event: MouseEvent): void {
    event.stopPropagation();
    this.formState.selectField(this.field().id);
  }

  onDuplicate(event: MouseEvent): void {
    event.stopPropagation();
    this.formState.duplicateField(this.field().id);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.formState.removeField(this.field().id);
  }
}
