import { Component, ElementRef, ViewChild, inject, effect } from '@angular/core';
import { NoteService } from '../../services/note';

@Component({
  selector: 'app-writing-canvas',
  standalone: true,
  imports: [],
  templateUrl: './writing-canvas.html',
  styleUrl: './writing-canvas.css'
})
export class WritingCanvasComponent {
  public noteService = inject(NoteService);
  isEmpty: boolean = true;
  typingTimer: any;
  
  loadedNoteId: string | null = null; 

  @ViewChild('editor') editorElement!: ElementRef;

  constructor() {
    effect(() => {
      const activeNote = this.noteService.getActiveNote();
      
      if (this.editorElement && activeNote) {
        // MAGIA AQUÍ: Solo ejecutamos esto si acabamos de cambiar de nota.
        // Al encerrar el isEmpty aquí adentro, matamos el bug del cursor invertido.
        if (this.loadedNoteId !== activeNote.id) {
           this.editorElement.nativeElement.innerHTML = activeNote.contenido;
           this.loadedNoteId = activeNote.id;
           this.isEmpty = this.editorElement.nativeElement.innerText.trim().length === 0;
        }
      } else if (!activeNote) {
        this.loadedNoteId = null;
      }
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLElement;
    const htmlContent = target.innerHTML;
    const plainText = target.innerText.trim();
    
    this.isEmpty = plainText.length === 0;
    
    this.noteService.updateActiveNoteContent(htmlContent);

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.noteService.handleAFKState(htmlContent);
    }, 1000);
  }

  focusEditor() {
    if (this.editorElement) {
      this.editorElement.nativeElement.focus();
    }
  }
}