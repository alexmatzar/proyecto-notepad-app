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

  currentFontSize: number = 16; 
  savedSelection: Range | null = null;

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
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  keepFocus(event: Event) {
    event.preventDefault(); 
  }

  executeCommand(command: string, value?: string) {
    const editor = document.querySelector('.editable-area') as HTMLElement;
    if (editor) editor.focus();

    if (this.savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
      }
    }
    
    document.execCommand(command, false, value);

    if (editor) {
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
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

  applyCustomFontSize(size: number) {
    const editor = document.querySelector('.editable-area') as HTMLElement;
    if (editor) editor.focus();

    if (this.savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
      }
    }

    const sel = window.getSelection();
    if (!sel) return;

    if (sel.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = size + 'px';
      span.innerHTML = '&#8203;'; 
      
      const range = sel.getRangeAt(0);
      range.insertNode(span);
      range.setStart(span.firstChild as Node, 1);
      range.collapse(true);
      
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('fontSize', false, '7');
      
      const fontElements = document.querySelectorAll('font[size="7"]');
      
      fontElements.forEach((node) => {
        const el = node as HTMLElement;
        el.removeAttribute('size');
        el.style.fontSize = size + 'px';
      });
    }

    if (editor) {
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  increaseFontSize() {
    this.currentFontSize += 2;
    this.applyCustomFontSize(this.currentFontSize);
  }

  decreaseFontSize() {
    if (this.currentFontSize > 2) {
      this.currentFontSize -= 2;
      this.applyCustomFontSize(this.currentFontSize);
    }
  }

  onFontSizeFocus() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this.savedSelection = sel.getRangeAt(0);
    }
  }

  onFontSizeManualChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (!isNaN(val)) {
      this.currentFontSize = val;
      this.applyCustomFontSize(val);
    }
  }
}