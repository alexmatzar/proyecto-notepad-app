import {
  Component, ElementRef, ViewChild, inject, effect,
  AfterViewInit, ChangeDetectorRef, HostListener
} from '@angular/core';
import { NoteService } from '../../services/note';

declare var pdfMake: any;
declare var htmlToPdfmake: any;

@Component({
  selector: 'app-writing-canvas',
  standalone: true,
  imports: [],
  templateUrl: './writing-canvas.html',
  styleUrl: './writing-canvas.css'
})
export class WritingCanvasComponent implements AfterViewInit {
  public noteService = inject(NoteService);
  private cdr = inject(ChangeDetectorRef);

  isEmpty: boolean = true;
  typingTimer: any;
  loadedNoteId: string | null = null;

  wordCount: number = 0;
  charCount: number = 0;

  isCopied: boolean = false;
  showClearModal: boolean = false;

  showDownloadModal: boolean = false;
  selectedFormat: 'TEXT' | 'PDF' | 'WORD' = 'TEXT';

  @ViewChild('editor', { static: true }) editorElement!: ElementRef;

  constructor() {
    effect(() => {
      const activeNote = this.noteService.getActiveNote();

      if (this.editorElement && activeNote) {
        if (this.loadedNoteId !== activeNote.id) {
          this.editorElement.nativeElement.innerHTML = activeNote.contenido;
          this.loadedNoteId = activeNote.id;

          const rawText = this.editorElement.nativeElement.innerText || '';
          this.isEmpty = rawText.trim().length === 0;
          this.updateCounts(rawText);
        }
      } else if (!activeNote) {
        this.loadedNoteId = null;
        this.wordCount = 0;
        this.charCount = 0;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.focusEditor(), 100);

    // Delegated click handler for checklist checkboxes.
    // Checkboxes inside contenteditable are not normally interactive —
    // this handler intercepts the click and toggles the checked state,
    // then persists the change via the input event.
    this.editorElement.nativeElement.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
        // Allow default toggle, then persist
        setTimeout(() => {
          const html = this.editorElement.nativeElement.innerHTML;
          this.noteService.updateActiveNoteContent(html);
        }, 0);
      }
    });
  }

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────────
  // These are handled natively by the browser inside contenteditable for
  // Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U), Undo (Ctrl+Z),
  // Redo (Ctrl+Y / Ctrl+Shift+Z). We listen only to persist changes.
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const ctrl = event.ctrlKey || event.metaKey;
    if (!ctrl) return;

    // Let the browser handle the native command, then persist after a tick
    const nativeShortcuts = ['b','i','u','z','y'];
    if (nativeShortcuts.includes(event.key.toLowerCase())) {
      setTimeout(() => {
        const html = this.editorElement?.nativeElement?.innerHTML;
        if (html != null) {
          this.noteService.updateActiveNoteContent(html);
        }
      }, 0);
    }
  }

  onInput(event: Event): void {
    const target = event.target as HTMLElement;
    const htmlContent = target.innerHTML;
    const rawText = target.innerText;

    const cleanedText = rawText.replace(/\u200B/g, '');
    const plainText = cleanedText.trim();

    this.isEmpty = plainText.length === 0;
    this.updateCounts(cleanedText);
    this.noteService.updateActiveNoteContent(htmlContent);

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      const htmlSinFantasma = htmlContent.replace(/&#8203;/g, '').replace(/\u200B/g, '');
      this.noteService.handleAFKState(htmlSinFantasma);
    }, 1000);
  }

  updateCounts(text: string): void {
    this.charCount = text.length;
    const trimmed = text.trim();
    this.wordCount = trimmed.length > 0 ? trimmed.split(/\s+/).length : 0;
  }

  copyToClipboard(): void {
    if (this.isEmpty || !this.editorElement) return;
    const textToCopy = this.editorElement.nativeElement.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.isCopied = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.detectChanges();
      }, 2000);
    }).catch(err => console.error('Error al copiar al portapapeles:', err));
  }

  openClearModal(): void {
    if (this.isEmpty) return;
    this.showClearModal = true;
  }

  cancelClear(): void {
    this.showClearModal = false;
  }

  confirmClear(): void {
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = '';
      this.editorElement.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.showClearModal = false;
      this.focusEditor();
    }
  }

  openDownloadModal(): void {
    if (this.isEmpty) return;
    this.showDownloadModal = true;
    this.selectedFormat = 'TEXT';
  }

  closeDownloadModal(): void {
    this.showDownloadModal = false;
  }

  selectDownloadFormat(format: 'TEXT' | 'PDF' | 'WORD'): void {
    this.selectedFormat = format;
  }

  executeDownload(): void {
    if (!this.editorElement || this.isEmpty) return;

    const activeNote = this.noteService.getActiveNote();
    let fileName = activeNote ? activeNote.titulo : 'Untitled Document';
    fileName = fileName.replace(/[\\/:*?"<>|]/g, '');

    if (this.selectedFormat === 'PDF') {
      let rawHtml = this.editorElement.nativeElement.innerHTML;
      rawHtml = rawHtml.replace(/&#8203;/g, '').replace(/\u200B/g, '');
      const pdfMakeContent = htmlToPdfmake(rawHtml, { window: window });
      const docDefinition = {
        content: pdfMakeContent,
        defaultStyle: { fontSize: 12 },
        pageMargins: [40, 40, 40, 40]
      };
      pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
      this.closeDownloadModal();
      return;
    }

    const rawText = this.editorElement.nativeElement.innerText;
    let contentToDownload = rawText;
    let mimeType = 'text/plain';
    let extension = '.txt';

    if (this.selectedFormat === 'WORD') {
      const htmlContent = this.editorElement.nativeElement.innerHTML;
      contentToDownload = `<html><head><meta charset='utf-8'></head><body>${htmlContent}</body></html>`;
      mimeType = 'application/msword';
      extension = '.doc';
    }

    const blob = new Blob([contentToDownload], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.closeDownloadModal();
  }

  focusEditor(): void {
    if (!this.editorElement) return;
    const el = this.editorElement.nativeElement;
    if (document.activeElement === el) return;
    el.focus();
    if (el.innerText.trim().length > 0) {
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}