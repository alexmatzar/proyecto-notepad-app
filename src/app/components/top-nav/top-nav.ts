import { Component, Output, EventEmitter, inject } from '@angular/core';
import { NoteService } from '../../services/note';

@Component({
  selector: 'app-top-nav',
  imports: [],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css'
})
export class TopNavComponent {
  @Output() hamburgerClick = new EventEmitter<void>();

public noteService = inject(NoteService);

  onHamburger() {
    this.hamburgerClick.emit();
  }

  // Evento que se dispara cada vez que el usuario escribe en el input del titulo
  onTitleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.noteService.updateActiveNoteTitle(input.value);
  }
} 