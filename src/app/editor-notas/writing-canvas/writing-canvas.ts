import { Component, ElementRef, ViewChild, inject, effect, AfterViewInit } from '@angular/core';
import { NoteService } from '../../services/note';

@Component({
  selector: 'app-writing-canvas',
  standalone: true,
  imports: [],
  templateUrl: './writing-canvas.html',
  styleUrl: './writing-canvas.css'
})
export class WritingCanvasComponent implements AfterViewInit {
  public noteService = inject(NoteService);
  isEmpty: boolean = true;
  typingTimer: any;
  loadedNoteId: string | null = null; 

  wordCount: number = 0;
  charCount: number = 0;

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusEditor();
    }, 100);
  }

onInput(event: Event) {
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

  updateCounts(text: string) {
    this.charCount = text.length; 
    const trimmed = text.trim();
    this.wordCount = trimmed.length > 0 ? trimmed.split(/\s+/).length : 0;
  }

  focusEditor() {
    if (!this.editorElement) return;
    const el = this.editorElement.nativeElement;

    if (document.activeElement === el) {
      return; 
    }

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