import { TestBed } from '@angular/core/testing';
import JSZip from 'jszip';
import { STARTER_TEMPLATES } from '../constants/starter-templates';
import { ProjectExportService } from './project-export.service';

describe('ProjectExportService', () => {
  let service: ProjectExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectExportService);
  });

  it('should export a valid ZIP package containing all generated files', async () => {
    const config = STARTER_TEMPLATES[0];
    const zipBlob = await service.exportProjectZip(config);

    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(500);

    // Load and inspect the generated ZIP structure
    const unzipped = await JSZip.loadAsync(zipBlob);
    const folder = unzipped.folder(config.id);

    expect(folder).toBeDefined();
    expect(folder?.file('generated-form.component.ts')).toBeDefined();
    expect(folder?.file('generated-form.component.html')).toBeDefined();
    expect(folder?.file('generated-form.component.css')).toBeDefined();
    expect(folder?.file('generated-form.model.ts')).toBeDefined();
    expect(folder?.file('form-config.json')).toBeDefined();
    expect(folder?.file('README.md')).toBeDefined();

    const tsContent = await folder?.file('generated-form.component.ts')?.async('string');
    expect(tsContent).toContain('EmployeeRegistrationComponent');

    const configContent = await folder?.file('form-config.json')?.async('string');
    const parsed = JSON.parse(configContent || '{}');
    expect(parsed.id).toBe('employee-registration');
  });
});
