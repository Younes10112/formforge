export interface GeneratedFile {
  name: string;
  language: 'typescript' | 'html' | 'css' | 'json' | 'markdown';
  content: string;
}

export interface CodeGenDiagnostics {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GeneratedProject {
  componentTs: GeneratedFile;
  componentHtml: GeneratedFile;
  componentCss: GeneratedFile;
  modelTs: GeneratedFile;
  configJson: GeneratedFile;
  readmeMd: GeneratedFile;
  diagnostics: CodeGenDiagnostics;
}
