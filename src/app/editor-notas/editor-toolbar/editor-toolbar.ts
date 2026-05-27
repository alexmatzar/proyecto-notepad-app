import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './editor-toolbar.html',
  styleUrl: './editor-toolbar.css'
})
export class EditorToolbarComponent {
  openDropdown: string | null = null;

  toggleDropdown(dropdownName: string, event: Event) {
    event.stopPropagation();
    if (this.openDropdown === dropdownName) {
      this.openDropdown = null;
    } else {
      this.openDropdown = dropdownName;
    }
  }

  // SOLUCIÓN AL ERROR: Simplemente quitamos el ['$event']
  @HostListener('document:click')
  onDocumentClick() {
    this.openDropdown = null;
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }
}