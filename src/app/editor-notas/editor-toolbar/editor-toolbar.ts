import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './editor-toolbar.html',
  styleUrl: './editor-toolbar.css'
})
export class EditorToolbarComponent {

  // ─── State ───────────────────────────────────────────────────────────────────
  openDropdown: string | null = null;
  selectedFont: string = 'Arial';
  selectedFormat: string = 'Normal';

  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  isStrike: boolean = false;

  currentFontSize: number = 16;
  savedSelection: Range | null = null;

  currentAlignIcon: string = 'fa-solid fa-align-left';
  currentAlignLabel: string = 'Left';

  selectedTextColor: string = '#000000';
  selectedHighlightColor: string = '#FFFF00';

  readonly TEXT_COLORS = [
    '#000000','#434343','#666666','#999999','#b7b7b7','#ffffff',
    '#ff0000','#ff4500','#ff9900','#ffff00','#00ff00','#00ffff',
    '#0000ff','#9900ff','#ff00ff','#e06666','#f6b26b','#ffd966',
    '#93c47d','#76a5af','#6fa8dc','#8e7cc3','#c27ba0',
  ];

  readonly HIGHLIGHT_COLORS = [
    '#FFFF00','#00FF00','#00FFFF','#FF00FF','#FF0000','#0000FF',
    '#FFA500','#FFC0CB','#90EE90','#ADD8E6','#DDA0DD','#F0E68C',
    'transparent',
  ];

  // ─── Selection helpers ───────────────────────────────────────────────────────
  private captureSelection(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      try {
        this.savedSelection = sel.getRangeAt(0).cloneRange();
      } catch {
        this.savedSelection = null;
      }
    }
  }

  private restoreSelection(): void {
    const sel = window.getSelection();
    if (!sel || !this.savedSelection) return;
    try {
      sel.removeAllRanges();
      sel.addRange(this.savedSelection);
    } catch {
      // Range may be stale if DOM changed — ignore
    }
  }

  // Called on (mousedown) for every toolbar button.
  // Prevents the button from stealing focus and captures the current selection.
  keepFocus(event: MouseEvent): void {
    event.preventDefault();
    this.captureSelection();
  }

  // ─── Core command executor ────────────────────────────────────────────────────
  // Focuses the editor, restores the saved selection, runs execCommand,
  // then dispatches an input event so NoteService persists the change.
  executeCommand(command: string, value: string = ''): void {
    const editor = this.getEditor();
    if (!editor) return;

    editor.focus();

    if (this.savedSelection) {
      this.restoreSelection();
    }

    document.execCommand(command, false, value);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    this.refreshFormattingState();
  }

  private getEditor(): HTMLElement | null {
    return document.querySelector('.editable-area') as HTMLElement | null;
  }

  private refreshFormattingState(): void {
    this.isBold      = document.queryCommandState('bold');
    this.isItalic    = document.queryCommandState('italic');
    this.isUnderline = document.queryCommandState('underline');
    this.isStrike    = document.queryCommandState('strikeThrough');
  }

  // ─── Dropdown ────────────────────────────────────────────────────────────────
  toggleDropdown(name: string, event: MouseEvent): void {
    event.stopPropagation();
    this.captureSelection();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdown = null;
  }

  // ─── Formatting state tracker ─────────────────────────────────────────────────
  @HostListener('document:selectionchange')
  checkFormatting(): void {
    this.refreshFormattingState();
  }

  // ─── Undo / Redo ─────────────────────────────────────────────────────────────
  // These do NOT need selection — they operate on the editor's own history.
  undo(): void {
    const editor = this.getEditor();
    if (!editor) return;
    editor.focus();
    document.execCommand('undo', false, '');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  redo(): void {
    const editor = this.getEditor();
    if (!editor) return;
    editor.focus();
    document.execCommand('redo', false, '');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ─── Font family ──────────────────────────────────────────────────────────────
  applyFont(fontName: string): void {
    this.executeCommand('fontName', fontName);
    this.selectedFont = fontName;
    this.openDropdown = null;
  }

  // ─── Block format ─────────────────────────────────────────────────────────────
  applyFormat(tag: string, label: string): void {
    this.executeCommand('formatBlock', `<${tag}>`);
    this.selectedFormat = label;
    this.openDropdown = null;
  }

  // ─── Lists ───────────────────────────────────────────────────────────────────
  applyList(command: string): void {
    this.executeCommand(command);
    this.openDropdown = null;
  }

  applyChecklist(): void {
    // Insert a semantic checklist item.
    // Checkboxes inside contenteditable are handled by a delegated click
    // listener set up in writing-canvas.ts.
    const html = '<ul class="checklist" style="list-style:none;padding-left:0"><li><label style="display:flex;align-items:center;gap:6px"><input type="checkbox"><span>&nbsp;</span></label></li></ul>';
    this.executeCommand('insertHTML', html);
    this.openDropdown = null;
  }

  // ─── Alignment ───────────────────────────────────────────────────────────────
  applyAlign(command: string, icon: string, label: string): void {
    this.executeCommand(command);
    this.currentAlignIcon  = icon;
    this.currentAlignLabel = label;
    this.openDropdown = null;
  }

  // "Start" = logical start of text direction (LTR → left, RTL → right).
  // execCommand has no native command — we apply direction via inline style
  // on the block-level element that contains the selection.
  applyDirection(dir: 'ltr' | 'rtl'): void {
    const editor = this.getEditor();
    if (!editor) return;
    editor.focus();
    if (this.savedSelection) this.restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    // Walk up to a block-level element
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const display = window.getComputedStyle(el).display;
        if (display === 'block' || display === 'list-item' || display === 'table-cell') {
          el.style.direction = dir;
          el.style.textAlign = dir === 'ltr' ? 'left' : 'right';
          break;
        }
      }
      node = node.parentNode;
    }
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    this.openDropdown = null;
  }

  // ─── Indent / Outdent ────────────────────────────────────────────────────────
  applyIndent(): void {
    this.executeCommand('indent');
    this.openDropdown = null;
  }

  applyOutdent(): void {
    this.executeCommand('outdent');
    this.openDropdown = null;
  }

  // ─── Text color ──────────────────────────────────────────────────────────────
  applyTextColor(color: string): void {
    this.selectedTextColor = color;
    this.executeCommand('foreColor', color);
    this.openDropdown = null;
  }

  // ─── Highlight ───────────────────────────────────────────────────────────────
  applyHighlight(color: string): void {
    this.selectedHighlightColor = color;
    if (color === 'transparent') {
      // Remove highlight
      this.executeCommand('hiliteColor', 'transparent');
    } else {
      this.executeCommand('hiliteColor', color);
    }
    this.openDropdown = null;
  }

  // ─── Text effects ────────────────────────────────────────────────────────────
  applyStrikethrough(): void {
    this.executeCommand('strikeThrough');
    this.openDropdown = null;
  }

  applySubscript(): void {
    this.executeCommand('subscript');
    this.openDropdown = null;
  }

  applySuperscript(): void {
    this.executeCommand('superscript');
    this.openDropdown = null;
  }

  clearFormatting(): void {
    this.executeCommand('removeFormat');
    this.openDropdown = null;
  }

  // ─── Hyperlink ───────────────────────────────────────────────────────────────
  insertHyperlink(): void {
    const editor = this.getEditor();
    if (!editor) return;
    editor.focus();
    if (this.savedSelection) this.restoreSelection();

    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString() : '';

    const url = window.prompt('Enter URL:', 'https://');
    if (!url || url.trim() === '' || url.trim() === 'https://') return;

    // Re-focus and restore after prompt clears selection (Chrome/Firefox)
    editor.focus();
    if (this.savedSelection) this.restoreSelection();

    if (selectedText) {
      document.execCommand('createLink', false, url.trim());
      // Make the link open in a new tab
      const links = editor.querySelectorAll(`a[href="${url.trim()}"]`);
      links.forEach(a => {
        (a as HTMLAnchorElement).target = '_blank';
        (a as HTMLAnchorElement).rel    = 'noopener noreferrer';
      });
    } else {
      const anchor = `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${url.trim()}</a>`;
      document.execCommand('insertHTML', false, anchor);
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ─── Insert menu ─────────────────────────────────────────────────────────────
  insertHorizontalRule(): void {
    this.executeCommand('insertHorizontalRule');
    this.openDropdown = null;
  }

  insertDate(): void {
    const now = new Date();
    const formatted = now.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.executeCommand('insertHTML', `<span>${formatted}</span>`);
    this.openDropdown = null;
  }

  insertImage(): void {
    // Trigger a hidden file input — we append it, click it, then remove it.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { document.body.removeChild(input); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        this.executeCommand('insertImage', src);
        this.openDropdown = null;
        document.body.removeChild(input);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

  // ─── Font size ───────────────────────────────────────────────────────────────
  onFontSizeFocus(): void {
    // Capture the selection before the input steals focus.
    this.captureSelection();
  }

  onFontSizeManualChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 400) {
      this.currentFontSize = val;
      this.applyCustomFontSize(val);
    }
  }

  increaseFontSize(): void {
    this.currentFontSize = Math.min(this.currentFontSize + 2, 400);
    this.applyCustomFontSize(this.currentFontSize);
  }

  decreaseFontSize(): void {
    this.currentFontSize = Math.max(this.currentFontSize - 2, 1);
    this.applyCustomFontSize(this.currentFontSize);
  }

  private applyCustomFontSize(size: number): void {
    const editor = this.getEditor();
    if (!editor) return;

    editor.focus();
    if (this.savedSelection) this.restoreSelection();

    const sel = window.getSelection();
    if (!sel) return;

    if (sel.isCollapsed) {
      // No selection — insert a zero-width span so subsequent typing uses the size
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      span.innerHTML = '&#8203;';
      const range = sel.getRangeAt(0);
      range.insertNode(span);
      range.setStart(span.firstChild as Node, 1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      // Has selection — use fontSize 7 trick then replace with px value
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('fontSize', false, '7');
      editor.querySelectorAll('font[size="7"]').forEach(node => {
        const el = node as HTMLElement;
        el.removeAttribute('size');
        el.style.fontSize = `${size}px`;
      });
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }
}