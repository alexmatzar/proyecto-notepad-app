import { Component, signal } from '@angular/core';
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

  onViewChange(view: string) {
    this.activeView.set(view);
  }

  onHamburgerClick() {
    this.sidebarPinned.update(v => !v);
  }
}