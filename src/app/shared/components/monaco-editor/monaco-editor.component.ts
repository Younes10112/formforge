import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import loader from '@monaco-editor/loader';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-monaco-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
      <div #editorContainer class="w-full h-full min-h-[460px]"></div>
      @if (!isLoaded()) {
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 text-gray-500 dark:bg-gray-900/90 dark:text-gray-400 p-6 font-mono text-xs">
          <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span>Loading Monaco Editor...</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `
})
export class MonacoEditorComponent implements AfterViewInit, OnDestroy {
  value = input<string>('');
  language = input<string>('typescript');
  readOnly = input<boolean>(true);

  valueChange = output<string>();

  editorContainer = viewChild<ElementRef<HTMLDivElement>>('editorContainer');

  private readonly themeService = inject(ThemeService, { optional: true });
  private editorInstance: any = null;
  private monacoInstance: any = null;
  isLoaded = signal<boolean>(false);
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      const val = this.value();
      if (this.editorInstance && this.editorInstance.getValue() !== val) {
        this.editorInstance.setValue(val || '');
      }
    });

    effect(() => {
      const lang = this.language();
      if (this.editorInstance && this.monacoInstance) {
        this.monacoInstance.editor.setModelLanguage(
          this.editorInstance.getModel(),
          this.normalizeLanguage(lang)
        );
      }
    });

    if (this.themeService) {
      effect(() => {
        const isDark = this.themeService!.isDark();
        if (this.editorInstance && this.monacoInstance) {
          this.monacoInstance.editor.setTheme(isDark ? 'vs-dark' : 'vs');
        }
      });
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const container = this.editorContainer()?.nativeElement;
    if (!container || typeof window === 'undefined') return;

    try {
      const monaco = await loader.init();
      this.monacoInstance = monaco;

      this.editorInstance = monaco.editor.create(container, {
        value: this.value() || '',
        language: this.normalizeLanguage(this.language()),
        theme: this.themeService?.isDark() !== false ? 'vs-dark' : 'vs',
        readOnly: this.readOnly(),
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        tabSize: 2,
        wordWrap: 'on'
      });

      this.editorInstance.onDidChangeModelContent(() => {
        const updated = this.editorInstance.getValue();
        this.valueChange.emit(updated);
      });

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this.editorInstance?.layout();
        });
        this.resizeObserver.observe(container);
      }

      this.isLoaded.set(true)
    } catch (err) {
      console.warn('Monaco editor initialization failed', err);
      this.isLoaded.set(true);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.editorInstance) {
      this.editorInstance.dispose();
    }
  }

  private normalizeLanguage(lang: string): string {
    switch (lang.toLowerCase()) {
      case 'ts':
      case 'typescript':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'markdown':
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  }
}
