import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { GeneratedFile, GeneratedProject } from '../../core/models/code-generation.model';
import { CodeGeneratorService } from '../../core/services/code-generator.service';
import { FormStateService } from '../../core/services/form-state.service';
import { ProjectExportService } from '../../core/services/project-export.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { MonacoEditorComponent } from '../../shared/components/monaco-editor/monaco-editor.component';

type CodeTab = 'typescript' | 'html' | 'model' | 'css' | 'json' | 'readme';

@Component({
  selector: 'app-code-workspace',
  imports: [MonacoEditorComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 flex flex-col h-full min-w-0 overflow-hidden'
  },
  template: `
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <!-- Top Control Bar (Tabs & Export Actions) -->
      <div class="h-12 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between shrink-0 select-none">
        <!-- File Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            (click)="activeTab.set('typescript')"
            [class]="activeTab() === 'typescript' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'"
            class="flex items-center gap-2 px-3 py-2 text-xs rounded-t-lg transition-all"
          >
            <span class="font-bold text-[10px] px-1 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">TS</span>
            <span>generated-form.component.ts</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('html')"
            [class]="activeTab() === 'html' ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'"
            class="flex items-center gap-2 px-3 py-2 text-xs rounded-t-lg transition-all"
          >
            <span class="font-bold text-[10px] px-1 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400">&lt;/&gt;</span>
            <span>generated-form.component.html</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('model')"
            [class]="activeTab() === 'model' ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'"
            class="flex items-center gap-2 px-3 py-2 text-xs rounded-t-lg transition-all"
          >
            <span class="font-bold text-[10px] px-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">MDL</span>
            <span>generated-form.model.ts</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('css')"
            [class]="activeTab() === 'css' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'"
            class="flex items-center gap-2 px-3 py-2 text-xs rounded-t-lg transition-all"
          >
            <span class="font-bold text-[10px] px-1 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">CSS</span>
            <span>generated-form.component.css</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('json')"
            [class]="activeTab() === 'json' ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'"
            class="flex items-center gap-2 px-3 py-2 text-xs rounded-t-lg transition-all"
          >
            <span class="font-bold text-[10px] px-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">&#123;&#125;</span>
            <span>form-config.json</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('readme')"
            [class]="activeTab() === 'readme' ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'"
            class="flex items-center gap-2 px-3 py-2 text-xs rounded-t-lg transition-all"
          >
            <span class="font-bold text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">MD</span>
            <span>README.md</span>
          </button>
        </div>

        <!-- Right Side Actions: Copy, Download Current, Download ZIP -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            (click)="copyCurrentCode()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 transition-all shadow-xs"
            title="Copy current file code"
          >
            <app-icon name="copy" [size]="13" />
            <span>Copy Code</span>
          </button>

          <button
            type="button"
            (click)="downloadCurrentFile()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 transition-all shadow-xs"
            title="Download this file"
          >
            <app-icon name="download" [size]="13" />
            <span>Download</span>
          </button>

          <button
            type="button"
            (click)="exportZip()"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-all shadow-blue-500/20"
            title="Download full project archive with all files"
          >
            <app-icon name="download" [size]="13" />
            <span>Export ZIP</span>
          </button>
        </div>
      </div>

      <!-- Diagnostic Banners (Warnings / Errors) -->
      @if (project().diagnostics.errors.length > 0) {
        <div class="p-3 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-start gap-2">
          <app-icon name="x" [size]="16" class="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold">Code Generation Diagnostics:</span>
            <ul class="list-disc list-inside mt-1 space-y-0.5">
              @for (err of project().diagnostics.errors; track err) {
                <li>{{ err }}</li>
              }
            </ul>
          </div>
        </div>
      }

      @if (project().diagnostics.warnings.length > 0 && project().diagnostics.errors.length === 0) {
        <div class="p-2.5 bg-amber-950/60 border-b border-amber-800 text-amber-200 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Warning: {{ project().diagnostics.warnings[0] }}</span>
          </div>
        </div>
      }

      <!-- Monaco Editor View -->
      <div class="flex-1 w-full h-full relative overflow-hidden">
        <app-monaco-editor
          [value]="currentFile().content"
          [language]="currentFile().language"
          [readOnly]="true"
        />
      </div>
    </div>
  `
})
export class CodeWorkspaceComponent {
  private readonly formState = inject(FormStateService);
  private readonly codeGenerator = inject(CodeGeneratorService);
  private readonly projectExport = inject(ProjectExportService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<CodeTab>('typescript');

  readonly project = computed<GeneratedProject>(() => {
    return this.codeGenerator.generateProject(this.formState.form());
  });

  readonly currentFile = computed<GeneratedFile>(() => {
    const p = this.project();
    switch (this.activeTab()) {
      case 'html':
        return p.componentHtml;
      case 'model':
        return p.modelTs;
      case 'css':
        return p.componentCss;
      case 'json':
        return p.configJson;
      case 'readme':
        return p.readmeMd;
      case 'typescript':
      default:
        return p.componentTs;
    }
  });

  async copyCurrentCode(): Promise<void> {
    const file = this.currentFile();
    const success = await this.projectExport.copyToClipboard(file.content);
    if (success) {
      this.toast.success(`Copied ${file.name} to clipboard!`, 'Code Copied');
    } else {
      this.toast.error('Failed to copy to clipboard', 'Error');
    }
  }

  downloadCurrentFile(): void {
    const file = this.currentFile();
    this.projectExport.downloadFile(file);
    this.toast.success(`Downloaded ${file.name}`);
  }

  async exportZip(): Promise<void> {
    try {
      this.toast.info('Generating project ZIP...', 'Exporting');
      const blob = await this.projectExport.exportProjectZip(this.formState.form());
      this.projectExport.downloadBlob(blob, `${this.formState.form().id || 'formforge-project'}.zip`);
      this.toast.success('ZIP package downloaded successfully!', 'Export Completed');
    } catch (err) {
      console.error(err);
      this.toast.error('Failed to export ZIP package', 'Error');
    }
  }
}
