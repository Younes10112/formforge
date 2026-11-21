import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormStateService } from '../../../../core/services/form-state.service';
import { ProjectExportService } from '../../../../core/services/project-export.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 flex items-center justify-between gap-4 shrink-0 shadow-sm z-30">
      <!-- Left: Logo & Form Info -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <app-icon name="layout" [size]="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold tracking-tight text-gray-900 dark:text-white text-base">Form<span class="text-blue-600">Forge</span></span>
              <span class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900">v1.0</span>
            </div>
          </div>
        </div>

        <div class="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

        <!-- Form Title & Save Indicator -->
        <div class="flex items-center gap-2">
          <input
            type="text"
            [value]="formState.form().title"
            (change)="onTitleChange($event)"
            class="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60 focus:bg-white dark:focus:bg-gray-800 px-2 py-1 rounded-lg border border-transparent focus:border-blue-400 focus:outline-none transition-all max-w-[180px] sm:max-w-xs truncate"
            title="Click to rename form"
          />
          @if (formState.isDirty()) {
            <span class="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Unsaved
            </span>
          } @else {
            <span class="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900 hidden md:flex">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Saved
            </span>
          }
        </div>
      </div>

      <!-- Center: Undo/Redo & View Switcher -->
      <div class="flex items-center gap-2">
        <!-- Undo / Redo -->
        <div class="hidden lg:flex items-center rounded-xl border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-50/50 dark:bg-gray-800/40">
          <button
            type="button"
            (click)="formState.undo()"
            [disabled]="!formState.canUndo()"
            title="Undo (Ctrl+Z)"
            class="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-all shadow-none hover:shadow-xs"
          >
            <app-icon name="undo" [size]="16" />
          </button>
          <button
            type="button"
            (click)="formState.redo()"
            [disabled]="!formState.canRedo()"
            title="Redo (Ctrl+Y)"
            class="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-all shadow-none hover:shadow-xs"
          >
            <app-icon name="redo" [size]="16" />
          </button>
        </div>

        <!-- View Mode Segmented Controls -->
        <div class="flex items-center rounded-xl border border-gray-200 dark:border-gray-800 p-1 bg-gray-100/80 dark:bg-gray-800/80">
          <button
            type="button"
            (click)="formState.setActiveTab('builder')"
            [class]="formState.activeTab() === 'builder' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all"
          >
            <app-icon name="layout" [size]="14" />
            <span class="hidden sm:inline">Builder</span>
          </button>
          <button
            type="button"
            (click)="formState.setActiveTab('preview')"
            [class]="formState.activeTab() === 'preview' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all"
          >
            <app-icon name="eye" [size]="14" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            (click)="formState.setActiveTab('code')"
            [class]="formState.activeTab() === 'code' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all"
          >
            <app-icon name="code" [size]="14" />
            <span>Code</span>
          </button>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-2">
        <!-- Templates button -->
        <button
          type="button"
          (click)="openTemplates.emit()"
          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          title="Choose a pre-built template"
        >
          <app-icon name="folder" [size]="14" />
          <span class="hidden md:inline">Templates</span>
        </button>

        <!-- JSON Import / Export -->
        <button
          type="button"
          (click)="openJsonModal.emit()"
          class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          title="Import or Export Form JSON Configuration"
        >
          <app-icon name="file-text" [size]="14" />
          <span class="hidden md:inline">JSON</span>
        </button>

        <!-- Save Form -->
        <button
          type="button"
          (click)="saveForm()"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-xs"
          title="Save Form (Ctrl+S)"
        >
          <app-icon name="save" [size]="14" />
          <span class="hidden sm:inline">Save</span>
        </button>

        <!-- Export ZIP Project button -->
        <button
          type="button"
          (click)="exportZip()"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-500/20 transition-all"
          title="Export Full Angular Project as ZIP"
        >
          <app-icon name="download" [size]="14" />
          <span>Export ZIP</span>
        </button>

        <div class="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-0.5"></div>

        <!-- Light / Dark Mode Toggle -->
        <button
          type="button"
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          [attr.aria-label]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          class="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all shadow-xs"
        >
          @if (themeService.isDark()) {
            <app-icon name="sun" [size]="15" class="text-amber-400" />
          } @else {
            <app-icon name="moon" [size]="15" class="text-slate-600" />
          }
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly formState = inject(FormStateService);
  readonly themeService = inject(ThemeService);
  private readonly projectExport = inject(ProjectExportService);
  private readonly toast = inject(ToastService);

  openTemplates = output<void>();
  openJsonModal = output<void>();

  onTitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value && input.value.trim()) {
      this.formState.updateFormMeta(input.value.trim());
    }
  }

  saveForm(): void {
    this.formState.saveCurrentForm();
    this.toast.success('Form configuration successfully saved!', 'Saved');
  }

  async exportZip(): Promise<void> {
    try {
      this.toast.info('Generating Angular Project ZIP package...', 'Exporting');
      const blob = await this.projectExport.exportProjectZip(this.formState.form());
      this.projectExport.downloadBlob(blob, `${this.formState.form().id || 'formforge-project'}.zip`);
      this.toast.success('ZIP package downloaded successfully!', 'Export Completed');
    } catch (err) {
      console.error(err);
      this.toast.error('Failed to generate project ZIP', 'Export Error');
    }
  }
}
