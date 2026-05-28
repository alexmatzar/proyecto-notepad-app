import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoteService, Note } from '../../services/note'; // Mantén esta ruta que te funcionó

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent {
  @Input() activeView: string = 'notes';
  @Input() isPinned: boolean = false;
  @Output() viewChange = new EventEmitter<string>();

  public noteService = inject(NoteService);
  
  showMore= false;
  isHovered = false;

  showDeleteModal = false;
  noteToDelete: Note | null = null;

  get isPanelOpen(): boolean {
    return this.isPinned || this.isHovered;
  }

  setView(view: string) {
    this.viewChange.emit(view);
  }

  onMouseEnter() { this.isHovered = true; }
  onMouseLeave() { this.isHovered = false; }

  // Crear nota llamando al servicio
  createNewNote() {
    this.noteService.createNote();
  }

  // Seleccionar nota llamando al servicio
  selectNote(id: string) {
    this.noteService.setActiveNote(id);
  }

  // --- LÓGICA DEL MODAL DE ELIMINAR ---
  openDeleteModal(note: Note, event: Event) {
    event.stopPropagation(); // Evita que se seleccione la nota al hacer clic en el basurero
    this.noteToDelete = note;
    this.showDeleteModal = true;
    this.isHovered = false; // Cerramos el panel al abrir el modal
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.noteToDelete = null;
  }

  executeDelete() {
    if (this.noteToDelete) {
      this.noteService.deleteNote(this.noteToDelete.id);
      this.cancelDelete(); // Cerramos y limpiamos
    }
  }
}