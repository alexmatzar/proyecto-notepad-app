import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './editor-toolbar.html',
  styleUrl: './editor-toolbar.css'
})
export class EditorToolbarComponent {
  menuAbierto: string | null = null;
  fuenteSel: string = 'Arial';
  fmtSel: string = 'Normal';

  esNeg: boolean = false;
  esCur: boolean = false;
  esSub: boolean = false;

  tamFuente: number = 16; 
  selGuardada: Range | null = null;

  altMenu(nombreMenu: string, evento: Event) {
    evento.stopPropagation();
    if (this.menuAbierto === nombreMenu) {
      this.menuAbierto = null;
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        this.selGuardada = sel.getRangeAt(0);
      }
      this.menuAbierto = nombreMenu;
    }
  }

  @HostListener('document:click')
  alClicDoc() {
    this.menuAbierto = null;
  }

  @HostListener('document:selectionchange')
  revFmt() {
    this.esNeg = document.queryCommandState('bold');
    this.esCur = document.queryCommandState('italic');
    this.esSub = document.queryCommandState('underline');
  }

  prevCierre(evento: Event) {
    evento.stopPropagation();
  }

  mantFoco(evento: Event) {
    evento.preventDefault(); 
  }

  ejecCmd(comando: string, valor?: string) {
    const editor = document.querySelector('.editable-area') as HTMLElement;
    if (editor) editor.focus();

    if (this.selGuardada) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.selGuardada);
      }
    }
    
    document.execCommand(comando, false, valor);

    if (editor) {
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  deshacer() { this.ejecCmd('undo'); }
  rehacer() { this.ejecCmd('redo'); }

  apliFuente(fuente: string) {
    this.ejecCmd('fontName', fuente);
    this.fuenteSel = fuente;
    this.menuAbierto = null;
  }

  apliFmt(etiq: string, etiqVista: string) {
    this.ejecCmd('formatBlock', `<${etiq}>`);
    this.fmtSel = etiqVista;
    this.menuAbierto = null;
  }

  apliLista(comando: string) {
    this.ejecCmd(comando);
    this.menuAbierto = null;
  }

  apliCheck() {
    const htmlCheck = '<ul style="list-style-type: none; padding-left: 0;"><li><input type="checkbox" style="margin-right: 8px;"> </li></ul>';
    this.ejecCmd('insertHTML', htmlCheck);
    this.menuAbierto = null;
  }

  apliTamFuente(tam: number) {
    const editor = document.querySelector('.editable-area') as HTMLElement;
    if (editor) editor.focus();

    if (this.selGuardada) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.selGuardada);
      }
    }

    const sel = window.getSelection();
    if (!sel) return;

    if (sel.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = tam + 'px';
      span.innerHTML = '&#8203;'; 
      
      const rango = sel.getRangeAt(0);
      rango.insertNode(span);
      rango.setStart(span.firstChild as Node, 1);
      rango.collapse(true);
      
      sel.removeAllRanges();
      sel.addRange(rango);
    } else {
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('fontSize', false, '7');
      
      const elemsFuente = document.querySelectorAll('font[size="7"]');
      
      elemsFuente.forEach((nodo) => {
        const el = nodo as HTMLElement;
        el.removeAttribute('size');
        el.style.fontSize = tam + 'px';
      });
    }

    if (editor) {
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  aumFuente() {
    this.tamFuente += 2;
    this.apliTamFuente(this.tamFuente);
  }

  dismFuente() {
    if (this.tamFuente > 2) {
      this.tamFuente -= 2;
      this.apliTamFuente(this.tamFuente);
    }
  }

  alFocoTam() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this.selGuardada = sel.getRangeAt(0);
    }
  }

  alCambioTam(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (!isNaN(val)) {
      this.tamFuente = val;
      this.apliTamFuente(val);
    }
  }
}