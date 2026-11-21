import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormConfiguration } from '../../core/models/form-config.model';
import { FormStateService } from '../../core/services/form-state.service';
import { ProjectExportService } from '../../core/services/project-export.service';
import { ToastService } from '../../core/services/toast.service';
import { ValidationService } from '../../core/services/validation.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-import-export-modal',
  imports: [ModalComponent, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="JSON Import & Export"
      subtitle="Export or import complete FormForge configuration schemas"
      (close)="close.emit()"
    >
      <!-- Sub Tabs: Export vs Import -->
      <div class="flex border-b border-gray-100 dark:border-gray-800 mb-4 text-xs font-semibold">
        <button
          type="button"
          (click)="mode.set('export')"
          [class]="mode() === 'export' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'"
          class="pb-2.5 px-4 transition-colors"
        >
          Export Configuration
        </button>
        <button
          type="button"
          (click)="mode.set('import')"
          [class]="mode() === 'import' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'"
          class="pb-2.5 px-4 transition-colors"
        >
          Import Configuration
        </button>
      </div>

      <!-- EXPORT TAB -->
      @if (mode() === 'export') {
        <div class="space-y-4">
          <p class="text-xs text-gray-500">
            This JSON object defines the complete structure, validation rules, appearance, and conditional rules of your form:
          </p>

          <pre class="w-full max-h-72 p-3 rounded-xl bg-gray-900 text-emerald-400 font-mono text-xs overflow-auto leading-relaxed">{{ formJson() }}</pre>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="copyJson()"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <app-icon name="copy" [size]="14" />
              <span>Copy JSON</span>
            </button>
            <button
              type="button"
              (click)="downloadJson()"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-xs"
            >
              <app-icon name="download" [size]="14" />
              <span>Download .json</span>
            </button>
          </div>
        </div>
      }

      <!-- IMPORT TAB -->
      @if (mode() === 'import') {
        <div class="space-y-4">
          <p class="text-xs text-gray-500">
            Paste your FormForge JSON configuration below or upload a JSON file:
          </p>

          <!-- File Upload dropzone -->
          <div class="flex items-center justify-center w-full">
            <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <div class="flex flex-col items-center justify-center pt-2 pb-3">
                <app-icon name="upload" [size]="20" class="text-gray-400 mb-1" />
                <p class="text-xs text-gray-500"><span class="font-semibold text-blue-600">Click to upload</span> or drag and drop .json</p>
              </div>
              <input type="file" accept=".json" (change)="onFileSelected($event)" class="hidden" />
            </label>
          </div>

          <textarea
            rows="6"
            [ngModel]="importText()"
            (ngModelChange)="importText.set($event)"
            placeholder="Paste FormForge JSON here..."
            class="w-full p-3 font-mono text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
          ></textarea>

          @if (importErrors().length > 0) {
            <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <span class="font-semibold">Validation Errors:</span>
              <ul class="list-disc list-inside">
                @for (err of importErrors(); track err) {
                  <li>{{ err }}</li>
                }
              </ul>
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="executeImport()"
              [disabled]="!importText().trim()"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-all shadow-xs"
            >
              <span>Validate & Import</span>
            </button>
          </div>
        </div>
      }
    </app-modal>
  `
})
export class ImportExportModalComponent {
  isOpen = input<boolean>(false);
  close = output<void>();

  private readonly formState = inject(FormStateService);
  private readonly validationService = inject(ValidationService);
  private readonly projectExport = inject(ProjectExportService);
  private readonly toast = inject(ToastService);

  readonly mode = signal<'export' | 'import'>('export');
  readonly importText = signal<string>('');
  readonly importErrors = signal<string[]>([]);

  readonly formJson = computed(() => {
    return JSON.stringify(this.formState.form(), null, 2);
  });

  async copyJson(): Promise<void> {
    const success = await this.projectExport.copyToClipboard(this.formJson());
    if (success) {
      this.toast.success('JSON copied to clipboard!');
    }
  }

  downloadJson(): void {
    this.projectExport.downloadConfigJson(this.formState.form());
    this.toast.success('Downloaded JSON configuration file');
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      this.importText.set(content);
    };
    reader.readAsText(file);
  }

  executeImport(): void {
    this.importErrors.set([]);

    try {
      const parsed = JSON.parse(this.importText());
      const result = this.validationService.validateFormConfiguration(parsed);

      if (!result.valid || !result.parsed) {
        this.importErrors.set(result.errors);
        this.toast.error('Import validation failed. Check errors below.', 'Invalid Schema');
        return;
      }

      this.formState.setForm(result.parsed);
      this.formState.saveCurrentForm();
      this.toast.success(`Successfully imported "${result.parsed.title}"!`, 'Imported');
      this.close.emit();
    } catch (e: any) {
      this.importErrors.set([`Syntax Error: ${e.message}`]);
      this.toast.error('The provided string is not valid JSON', 'Parse Error');
    }
  }
}
