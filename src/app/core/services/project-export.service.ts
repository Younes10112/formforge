import { inject, Injectable } from '@angular/core';
import JSZip from 'jszip';
import { GeneratedFile, GeneratedProject } from '../models/code-generation.model';
import { FormConfiguration } from '../models/form-config.model';
import { CodeGeneratorService } from './code-generator.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectExportService {
  private readonly codeGenerator = inject(CodeGeneratorService);

  async exportProjectZip(config: FormConfiguration): Promise<Blob> {
    const project: GeneratedProject = this.codeGenerator.generateProject(config);
    const zip = new JSZip();

    const folderName = config.id || 'generated-form';
    const folder = zip.folder(folderName) || zip;

    folder.file(project.componentTs.name, project.componentTs.content);
    folder.file(project.componentHtml.name, project.componentHtml.content);
    folder.file(project.componentCss.name, project.componentCss.content);
    folder.file(project.modelTs.name, project.modelTs.content);
    folder.file(project.configJson.name, project.configJson.content);
    folder.file(project.readmeMd.name, project.readmeMd.content);

    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  downloadFile(file: GeneratedFile): void {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    this.downloadBlob(blob, file.name);
  }

  downloadConfigJson(config: FormConfiguration): void {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    this.downloadBlob(blob, `${config.id || 'form-config'}.json`);
  }

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      return false;
    }
  }
}
