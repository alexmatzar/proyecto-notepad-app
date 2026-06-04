import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotaService, Nota } from '../../services/nota';

@Component({
  selector: 'app-barra-lat',
  standalone: true,
  imports: [],
  templateUrl: './barra-lat.html',
  styleUrls: ['./barra-lat.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BarraLatComponent {
  @Input() vistaActiva: string = 'notas';
  @Input() estaFijada: boolean = false;
  @Output() cambioDeVista = new EventEmitter<string>();

  public noteService = inject(NotaService);
  
  mostrarMas = false;
  estaConCursor = false;

  mostrarModalBorrado = false;
  notaABorrar: Nota | null = null;

  get estaPanelAbierto(): boolean {
    return this.estaFijada || this.estaConCursor;
  }

  establecerVista(vista: string) {
    this.cambioDeVista.emit(vista);
  }

  alEntrarRaton() { this.estaConCursor = true; }
  alSalirRaton() { this.estaConCursor = false; }

  crearNuevaNota() {
    this.noteService.crearunaNota();
  }

  seleccionarNota(id: string) {
    this.noteService.setActiveNote(id);
  }

  abrirModalBorrado(nota: Nota, evento: Event) {
    evento.stopPropagation(); 
    this.notaABorrar = nota;
    this.mostrarModalBorrado = true;
    this.estaConCursor = false; 
  }

  cancelarBorrado() {
    this.mostrarModalBorrado = false;
    this.notaABorrar = null;
  }

  ejecutarBorrado() {
    if (this.notaABorrar) {
      this.noteService.borrarNota(this.notaABorrar.id);
      this.cancelarBorrado(); 
    }
  }
}