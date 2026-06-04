import { Component, signal, effect } from '@angular/core';
import { BarraSupComponent } from './components/barra-sup/barra-sup';
import { BarraLatComponent } from './components/barra-lat/barra-lat';
import { EditorNotasComponent } from './editor-notas/editor-notas';

@Component({
  selector: 'app-root',
  imports: [BarraSupComponent, BarraLatComponent, EditorNotasComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  vistaActiva = signal<string>('notas');
  barraFijada = signal<boolean>(false);
  
  esModoOscuro = signal<boolean>(false);

  constructor() {
    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado === 'dark') {
      this.esModoOscuro.set(true);
      document.documentElement.classList.add('dark');
    }

    effect(() => {
      const esOscuro = this.esModoOscuro();
      if (esOscuro) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  alCambiarVista(vista: string) {
    this.vistaActiva.set(vista);
  }

  alHacerClicHamburguesa() {
    this.barraFijada.update(v => !v);
  }

  alternarTema() {
    this.esModoOscuro.update(v => !v);
  }
}