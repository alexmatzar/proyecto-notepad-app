import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  titulodocManualmente?: boolean;
  titulodocGenerado?: boolean;
  guardadoenDB?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotaService {
  notes = signal<Nota[]>([]);
  IdnotaActiva = signal<string | null>(null);
  
  cargUI = signal<boolean>(true);
  
  estSinc = signal<'Guardado en la nube' | 'Guardando...' | 'Error '>('Guardado en la nube');

  constructor(private http: HttpClient) {
     this.cargBD();
  }

  cargBD() {
    const url = `${environment.firebaseUrl}.json`;

    this.http.get<{ [key: string]: Nota }>(url).subscribe({
      next: (data) => {
        if (!data) {
          this.crearunaNota();
          this.cargUI.set(false);
          return;
        }

        const notasFB = Object.values(data).map(nota => ({
          ...nota,
          guardadoenDB: true,
          titulodocManualmente: nota.titulo !== 'Untitled Document',
          titulodocGenerado: nota.titulo !== 'Untitled Document'
        }));

        notasFB.sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());

        this.notes.set(notasFB);
        this.IdnotaActiva.set(notasFB[0].id);
        this.cargUI.set(false);
      },
      error: (err) => {
        this.crearunaNota(); 
        this.cargUI.set(false);
      }
    });
  }

  crearunaNota() {
    const notaVac = this.notes().find(n => n.titulo === 'Untitled Document' && n.contenido.trim() === '');
    
    if (notaVac) {
      if (this.IdnotaActiva() !== notaVac.id) {
        this.setActiveNote(notaVac.id);
      }
      return; 
    }

    const nvaNota: Nota = {
      id: crypto.randomUUID(), 
      titulo: 'Untitled Document',
      contenido: '',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      titulodocManualmente: false,
      titulodocGenerado: false,
      guardadoenDB: false
    };
    
    this.notes.update(notasAct => [nvaNota, ...notasAct]);
    this.IdnotaActiva.set(nvaNota.id);
  }

  setActiveNote(id: string) {
    this.IdnotaActiva.set(id);
  }

  obtNotaAct(): Nota | undefined {
    return this.notes().find(n => n.id === this.IdnotaActiva());
  }

  actContNota(cont: string) {
    const idAct = this.IdnotaActiva();
    if (!idAct) return;

    this.notes.update(notasAct => 
      notasAct.map(nota => 
        nota.id === idAct 
          ? { ...nota, contenido: cont, fechaActualizacion: new Date().toISOString() } 
          : nota
      )
    );
  }

  actTitNota(tit: string) {
    const idAct = this.IdnotaActiva();
    if (!idAct) return;

    const nvoTit = tit.trim() === '' ? 'Untitled Document' : tit.trim();

    this.notes.update(notasAct => 
      notasAct.map(nota => 
        nota.id === idAct 
          ? { 
              ...nota, 
              titulo: nvoTit, 
              fechaActualizacion: new Date().toISOString(),
              titulodocManualmente: nvoTit !== 'Untitled Document'
            } 
          : nota
      )
    );

    this.guardBDB(idAct);
  }

  manejarInact(cont: string) {
    const act = this.obtNotaAct();
    if (!act) return;

    let nvoTit = act.titulo;
    let genAuto = act.titulodocGenerado;

    if (!act.titulodocManualmente && !act.titulodocGenerado) {
      const contLimp = cont
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (contLimp.length > 0) {
        nvoTit = contLimp.substring(0, 30).trim();
        genAuto = true;
      }
    }

    this.notes.update(notasAct => 
      notasAct.map(nota => 
        nota.id === act.id 
          ? { ...nota, titulo: nvoTit, titulodocGenerado: genAuto } 
          : nota
      )
    );

    this.guardBDB(act.id);
  }

  borrarNota(id: string) {
    const url = `${environment.firebaseUrl}/${id}.json`;
    this.estSinc.set('Guardando...');
    
    this.http.delete(url).subscribe({
      next: () => {
        this.estSinc.set('Guardado en la nube');
      },
      error: (err) => {
        console.error('Error eliminando nota:', err);
        this.estSinc.set('Error ');
      }
    });

    this.notes.update(notasAct => notasAct.filter(nota => nota.id !== id));
    const rest = this.notes();
    
    if (rest.length === 0) {
      this.crearunaNota();
    } else if (this.IdnotaActiva() === id) {
      this.IdnotaActiva.set(rest[0].id);
    }
  }

  guardBDB(id: string) {
    const notaG = this.notes().find(n => n.id === id);
    if (!notaG) return;

    if (!notaG.titulodocManualmente && notaG.contenido.trim() === '') {
      return; 
    }

    const notaFB = {
      id: notaG.id,
      titulo: notaG.titulo,
      contenido: notaG.contenido,
      fechaCreacion: notaG.fechaCreacion,
      fechaActualizacion: notaG.fechaActualizacion
    };

    const url = `${environment.firebaseUrl}/${notaG.id}.json`;

    this.estSinc.set('Guardando...');

    if (!notaG.guardadoenDB) {
      this.http.put(url, notaFB).subscribe({
        next: () => {
          this.estSinc.set('Guardado en la nube'); 
          
          this.notes.update(notasAct =>
            notasAct.map(n => n.id === id ? { ...n, guardadoenDB: true } : n)
          );
        },
        error: (err) => {
          console.error('Error creando nota:', err);
          this.estSinc.set('Error ');
        }
      });
    } 
    else {
      this.http.patch(url, {
        titulo: notaG.titulo,
        contenido: notaG.contenido,
        fechaActualizacion: notaG.fechaActualizacion
      }).subscribe({
        next: () => {
          this.estSinc.set('Guardado en la nube');
        },
        error: (err) => {
          console.error('Error actualizando:', err);
          this.estSinc.set('Error ');
        }
      });
    }
  }
}