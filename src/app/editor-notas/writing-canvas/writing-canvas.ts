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

  @ViewChild('editor') editorElement!: ElementRef;

  constructor() {
    effect(() => {
      const activeNote = this.noteService.getActiveNote();
      if (this.editorElement && activeNote) {
        if (this.editorElement.nativeElement.innerText.trim() !== activeNote.contenido.trim()) {
           this.editorElement.nativeElement.innerText = activeNote.contenido;
        }
        this.isEmpty = activeNote.contenido.trim().length === 0;
      }
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLElement;
    const content = target.innerText;
    
    this.isEmpty = content.trim().length === 0;
    
    this.noteService.updateActiveNoteContent(content);

    clearTimeout(this.typingTimer);
    
    this.typingTimer = setTimeout(() => {
      this.noteService.handleAFKState(content);
    }, 1000);
  }

  focusEditor() {
    if (this.editorElement) {
      this.editorElement.nativeElement.focus();
    }
  }
}