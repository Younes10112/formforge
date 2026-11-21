import { Injectable, effect, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'formforge_theme';

  readonly theme = signal<AppTheme>(this.getInitialTheme());
  readonly isDark = signal<boolean>(false);

  constructor() {
    this.updateThemeState(this.theme());

    // Listen for OS prefers-color-scheme changes when in 'system' mode
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (this.theme() === 'system') {
          this.applyTheme(e.matches);
        }
      });
    }

    // Reactively update theme whenever the theme signal changes
    effect(() => {
      const current = this.theme();
      this.updateThemeState(current);
    });
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.isDark() ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  private getInitialTheme(): AppTheme {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as AppTheme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    }
    return 'system';
  }

  private updateThemeState(theme: AppTheme): void {
    let darkActive = false;
    if (theme === 'dark') {
      darkActive = true;
    } else if (theme === 'light') {
      darkActive = false;
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyTheme(darkActive);
  }

  private applyTheme(darkActive: boolean): void {
    this.isDark.set(darkActive);
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (darkActive) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }
}
