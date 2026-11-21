import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { FormStateService } from '../../core/services/form-state.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { CodeWorkspaceComponent } from '../code-workspace/code-workspace.component';
import { ImportExportModalComponent } from '../import-export-modal/import-export-modal.component';
import { PreviewComponent } from '../preview/preview.component';
import { TemplatesModalComponent } from '../templates-modal/templates-modal.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HeaderComponent } from './components/header/header.component';
import { InspectorComponent } from './components/inspector/inspector.component';
import { PaletteComponent } from './components/palette/palette.component';

@Component({
  selector: 'app-builder',
  imports: [
    CdkDropListGroup,
    HeaderComponent,
    PaletteComponent,
    CanvasComponent,
    InspectorComponent,
    PreviewComponent,
    CodeWorkspaceComponent,
    TemplatesModalComponent,
    ImportExportModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyboardShortcuts($event)'
  },
  template: `
    <div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans">
      <!-- Global Top Header -->
      <app-header
        (openTemplates)="isTemplatesOpen.set(true)"
        (openJsonModal)="isJsonModalOpen.set(true)"
      />

      <!-- Studio Work Area -->
      <div cdkDropListGroup class="flex-1 flex overflow-hidden relative">
        @switch (formState.activeTab()) {
          @case ('preview') {
            <app-preview />
          }
          @case ('code') {
            <app-code-workspace />
          }
          @default {
            <!-- 3-Pane Visual Builder Studio -->
            <app-palette />
            <app-canvas />
            @if (formState.isInspectorOpen()) {
              <app-inspector />
            }
          }
        }
      </div>

      <!-- Modals -->
      <app-templates-modal
        [isOpen]="isTemplatesOpen()"
        (close)="isTemplatesOpen.set(false)"
      />

      <app-import-export-modal
        [isOpen]="isJsonModalOpen()"
        (close)="isJsonModalOpen.set(false)"
      />
    </div>
  `
})
export class BuilderComponent {
  readonly formState = inject(FormStateService);
  readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);

  readonly isTemplatesOpen = signal<boolean>(false);
  readonly isJsonModalOpen = signal<boolean>(false);

  handleKeyboardShortcuts(event: KeyboardEvent): void {
    const isCtrl = event.ctrlKey || event.metaKey;

    // Ignore when typing inside input or textarea
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName) && event.key !== 'Escape') {
      return;
    }

    if (isCtrl && event.key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.formState.redo();
      } else {
        this.formState.undo();
      }
    } else if (isCtrl && event.key === 'y') {
      event.preventDefault();
      this.formState.redo();
    } else if (isCtrl && event.key === 's') {
      event.preventDefault();
      this.formState.saveCurrentForm();
      this.toast.success('Form saved successfully!', 'Saved');
    } else if (event.key === 'Escape') {
      this.formState.selectField(null);
    }
  }
}
