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
  selectedFont: string = 'Arial';
  selectedFormat: string = 'Normal';

  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;

  savedSelection: Range | null = null;

  // --- VARIABLES PARA EL TAMAÑO DE FUENTE ---
  fontSizeIndex: number = 3; // 3 es el tamaño por defecto del navegador (equivale a ~16px)
  fontSizes: number[] = [10, 13, 16, 18, 24, 32, 48]; // Escalas 1 al 7

  // Getter para mostrar el número bonito en el HTML
  get displayFontSize(): number {
    return this.fontSizes[this.fontSizeIndex - 1] || 16;
  }

  toggleDropdown(dropdownName: string, event: Event) {
    event.stopPropagation();
    if (this.openDropdown === dropdownName) {
      this.openDropdown = null;
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        this.savedSelection = sel.getRangeAt(0);
      }
      this.openDropdown = dropdownName;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.openDropdown = null;
  }

  @HostListener('document:selectionchange')
  checkFormatting() {
    this.isBold = document.queryCommandState('bold');
    this.isItalic = document.queryCommandState('italic');
    this.isUnderline = document.queryCommandState('underline');

    // Detectar el tamaño de fuente en donde está el cursor
    const size = document.queryCommandValue('fontSize');
    if (size) {
      this.fontSizeIndex = parseInt(size, 10) || 3;
    }
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  keepFocus(event: Event) {
    event.preventDefault(); 
  }

  executeCommand(command: string, value?: string) {
    if (this.savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
      }
    }
    document.execCommand(command, false, value);
  }

  undo() { this.executeCommand('undo'); }
  redo() { this.executeCommand('redo'); }

  applyFont(fontName: string) {
    this.executeCommand('fontName', fontName);
    this.selectedFont = fontName;
    this.openDropdown = null;
  }

  applyFormat(tag: string, label: string) {
    this.executeCommand('formatBlock', tag);
    this.selectedFormat = label;
    this.openDropdown = null;
  }

  applyList(command: string) {
    this.executeCommand(command);
    this.openDropdown = null;
  }

  applyChecklist() {
    const checkboxHTML = '<ul style="list-style-type: none; padding-left: 0;"><li><input type="checkbox" style="margin-right: 8px;"> </li></ul>';
    this.executeCommand('insertHTML', checkboxHTML);
    this.openDropdown = null;
  }

  // --- FUNCIONES DE TAMAÑO DE FUENTE ---
  increaseFontSize() {
    if (this.fontSizeIndex < 7) { // 7 es el máximo nativo de HTML
      this.fontSizeIndex++;
      this.executeCommand('fontSize', this.fontSizeIndex.toString());
    }
  }

  decreaseFontSize() {
    if (this.fontSizeIndex > 1) { // 1 es el mínimo nativo de HTML
      this.fontSizeIndex--;
      this.executeCommand('fontSize', this.fontSizeIndex.toString());
    }
  }
}