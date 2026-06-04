import { Component, ElementRef, ViewChild, inject, effect, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NotaService } from '../../services/nota';

declare var pdfMake: any;
declare var htmlToPdfmake: any;

@Component({
  selector: 'app-writing-canvas',
  standalone: true,
  imports: [],
  templateUrl: './writing-canvas.html',
  styleUrl: './writing-canvas.css'
})
export class WritingCanvasComponent implements AfterViewInit {
  public servNota = inject(NotaService);
  private cdr = inject(ChangeDetectorRef);

  vacio: boolean = true;
  tempEscr: any;
  idNotaCarg: string | null = null; 

  cantPalab: number = 0;
  cantCarac: number = 0;

  copiado: boolean = false;
  modBorrAct: boolean = false;
  modDescAct: boolean = false;
  fmtDesc: 'TEXT' | 'PDF' | 'WORD' = 'TEXT';

  @ViewChild('editor', { static: true }) elemEd!: ElementRef;
  @ViewChild('fileInput') elemArch!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const notaActiva = this.servNota.obtNotaAct();
      
      if (this.elemEd && notaActiva) {
        if (this.idNotaCarg !== notaActiva.id) {
           this.elemEd.nativeElement.innerHTML = notaActiva.contenido;
           this.idNotaCarg = notaActiva.id;

           setTimeout(() => {
             const txtPuro = this.elemEd.nativeElement.innerText || '';
             this.vacio = txtPuro.trim().length === 0;
             this.actCants(txtPuro);
             this.enfocarEd();
           });
        }
      } else if (!notaActiva) {
        this.idNotaCarg = null;
        this.cantPalab = 0;
        this.cantCarac = 0;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.enfocarEd();
    }, 100);
  }

  alEscribir(evento: Event) {
    const obj = evento.target as HTMLElement;
    const htmlCont = obj.innerHTML;
    const txtPuro = obj.innerText;

    const txtLimpio = txtPuro.replace(/\u200B/g, '');
    const txtFinal = txtLimpio.trim();

    this.vacio = txtFinal.length === 0;
    this.actCants(txtLimpio);
    this.servNota.actContNota(htmlCont);

    clearTimeout(this.tempEscr);
    this.tempEscr = setTimeout(() => {
      const htmlLimp = htmlCont.replace(/&#8203;/g, '').replace(/\u200B/g, '');
      this.servNota.manejarInact(htmlLimp);
    }, 1000);
  }

  actCants(texto: string) {
    this.cantCarac = texto.length; 
    const recortado = texto.trim();
    this.cantPalab = recortado.length > 0 ? recortado.split(/\s+/).length : 0;
  }

  activarArch() {
    if (this.elemArch) {
      this.elemArch.nativeElement.click();
    }
  }

  alSubirArch(evento: Event) {
    const input = evento.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arch = input.files[0];
    const lector = new FileReader();

    lector.onload = (e) => {
      const cont = e.target?.result;
      if (typeof cont === 'string' && this.elemEd) {
        const contFmt = cont.replace(/\n/g, '<br>');
        this.elemEd.nativeElement.innerHTML = contFmt;
        this.elemEd.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.enfocarEd();
        input.value = '';
      }
    };

    lector.onerror = () => {
      console.error("Error al leer el archivo");
      input.value = '';
    };

    lector.readAsText(arch);
  }

  copiarPort() {
    if (this.vacio || !this.elemEd) return;

    const texto = this.elemEd.nativeElement.innerText;
    
    navigator.clipboard.writeText(texto).then(() => {
      this.copiado = true;
      this.cdr.detectChanges(); 
      setTimeout(() => {
        this.copiado = false;
        this.cdr.detectChanges();
      }, 2000);
    }).catch(err => {
      console.error("Error al copiar al portapapeles:", err);
    });
  }

  abrModBorr() {
    if (this.vacio) return;
    this.modBorrAct = true;
  }

  cancBorr() {
    this.modBorrAct = false;
  }

  confBorr() {
    if (this.elemEd) {
      this.elemEd.nativeElement.innerHTML = '';
      this.elemEd.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.modBorrAct = false;
      this.enfocarEd();
    }
  }

  abrModDesc() {
    if (this.vacio) return;
    this.modDescAct = true;
    this.fmtDesc = 'TEXT'; 
  }

  cerrModDesc() {
    this.modDescAct = false;
  }

  selFmtDesc(fmt: 'TEXT' | 'PDF' | 'WORD') {
    this.fmtDesc = fmt;
  }

  ejecDesc() {
    if (!this.elemEd || this.vacio) return;
    
    const notaAct = this.servNota.obtNotaAct();
    let nomArch = notaAct ? notaAct.titulo : 'Untitled Document';
    nomArch = nomArch.replace(/[\\/:*?"<>|]/g, '');

    if (this.fmtDesc === 'PDF') {
      let rawHtml = this.elemEd.nativeElement.innerHTML;
      rawHtml = rawHtml.replace(/&#8203;/g, '').replace(/\u200B/g, '');
      const contPdfMake = htmlToPdfmake(rawHtml, { window: window });
      const defDoc = {
        content: contPdfMake,
        defaultStyle: { fontSize: 12 },
        pageMargins: [ 40, 40, 40, 40 ] 
      };
      pdfMake.createPdf(defDoc).download(`${nomArch}.pdf`);
      this.cerrModDesc();
      return; 
    }

    const txtPuro = this.elemEd.nativeElement.innerText;
    let contADesc = txtPuro;
    let tipoMime = 'text/plain';
    let ext = '.txt';

    if (this.fmtDesc === 'WORD') {
      const contHtml = this.elemEd.nativeElement.innerHTML;
      contADesc = `<html><head><meta charset='utf-8'></head><body>${contHtml}</body></html>`;
      tipoMime = 'application/msword';
      ext = '.doc';
    }

    const blob = new Blob([contADesc], { type: tipoMime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomArch}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.cerrModDesc();
  }

  enfocarEd() {
    if (!this.elemEd) return;
    const el = this.elemEd.nativeElement;

    el.focus();

    if (el.innerText.trim().length > 0) {
      const rango = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        rango.selectNodeContents(el);
        rango.collapse(false);
        sel.removeAllRanges();
        sel.addRange(rango);
      }
    }
  }
}