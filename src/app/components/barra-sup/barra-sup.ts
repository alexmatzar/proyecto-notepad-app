import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { NotaService } from '../../services/nota';

@Component({
  selector: 'app-barra-sup',
  imports: [],
  templateUrl: './barra-sup.html',
  styleUrl: './barra-sup.css'
})
export class BarraSupComponent {
  @Output() clicHamburguesa = new EventEmitter<void>();
  @Output() clicAlternarTema = new EventEmitter<void>();
  @Input() esModoOscuro: boolean = false;

  public servNota = inject(NotaService);

  alClicHamb() {
    this.clicHamburguesa.emit();
  }

  alAltTema() {
    this.clicAlternarTema.emit();
  }

  alCambiarTit(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.servNota.actTitNota(input.value);
  }
}