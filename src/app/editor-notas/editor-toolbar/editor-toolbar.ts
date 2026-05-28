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

  toggleDropdown(dropdownName: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === dropdownName ? null : dropdownName;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.openDropdown = null;
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  // SOLUCIÓN AL FOCO: Evita que el botón le quite la selección al texto
  keepFocus(event: Event) {
    event.preventDefault();
  }

  executeCommand(command: string, value?: string) {
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
    this.executeCommand('formatBlock', `<${tag}>`);
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
}