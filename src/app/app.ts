import { Component, signal, effect } from '@angular/core';
import { TopNavComponent } from './components/top-nav/top-nav';
import { SidebarComponent } from './components/sidebar/sidebar';
import { EditorNotasComponent } from './editor-notas/editor-notas';

@Component({
  selector: 'app-root',
  imports: [TopNavComponent, SidebarComponent, EditorNotasComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeView = signal<string>('notes');
  sidebarPinned = signal<boolean>(false);
  
  isDarkMode = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }

    effect(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  onViewChange(view: string) {
    this.activeView.set(view);
  }

  onHamburgerClick() {
    this.sidebarPinned.update(v => !v);
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}