import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { NoteService } from '../../services/note';

@Component({
  selector: 'app-top-nav',
  imports: [],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css'
})
export class TopNavComponent {
  @Output() hamburgerClick = new EventEmitter<void>();
  @Output() themeToggleClick = new EventEmitter<void>();
  @Input() isDarkMode: boolean = false;

public noteService = inject(NoteService);

  onHamburger() {
    this.hamburgerClick.emit();
  }

  onToggleTheme() {
    this.themeToggleClick.emit();
  }

  onTitleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.noteService.updateActiveNoteTitle(input.value);
  }
}