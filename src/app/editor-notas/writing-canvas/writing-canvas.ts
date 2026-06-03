import { Component, ElementRef, ViewChild, inject, effect, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NoteService } from '../../services/note';

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
  public noteService = inject(NoteService);

  private cdr = inject(ChangeDetectorRef);

  isEmpty: boolean = true;
  typingTimer: any;
  loadedNoteId: string | null = null; 

  wordCount: number = 0;
  charCount: number = 0;

  isCopied: boolean = false;
  showClearModal: boolean = false;

  showDownloadModal: boolean = false;
  selectedFormat: 'TEXT' | 'PDF' | 'WORD' = 'TEXT';

  @ViewChild('editor', { static: true }) editorElement!: ElementRef;

  @ViewChild('fileInput') fileInputElement!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const activeNote = this.noteService.getActiveNote();
      
      if (this.editorElement && activeNote) {
        if (this.loadedNoteId !== activeNote.id) {
           this.editorElement.nativeElement.innerHTML = activeNote.contenido;
           this.loadedNoteId = activeNote.id;

           const rawText = this.editorElement.nativeElement.innerText || '';
           this.isEmpty = rawText.trim().length === 0;
           this.updateCounts(rawText);
        }
      } else if (!activeNote) {
        this.loadedNoteId = null;
        this.wordCount = 0;
        this.charCount = 0;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusEditor();
    }, 100);
  }

  onInput(event: Event) {
    const target = event.target as HTMLElement;
    const htmlContent = target.innerHTML;
    const rawText = target.innerText;

    const cleanedText = rawText.replace(/\u200B/g, '');
    const plainText = cleanedText.trim();

    this.isEmpty = plainText.length === 0;
    this.updateCounts(cleanedText);
    this.noteService.updateActiveNoteContent(htmlContent);

    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      const htmlSinFantasma = htmlContent.replace(/&#8203;/g, '').replace(/\u200B/g, '');
      this.noteService.handleAFKState(htmlSinFantasma);
    }, 1000);
  }

  updateCounts(text: string) {
    this.charCount = text.length; 
    const trimmed = text.trim();
    this.wordCount = trimmed.length > 0 ? trimmed.split(/\s+/).length : 0;
  }

  // =======================================================
  // LÓGICA DE UPLOAD DOC
  // =======================================================
  
  // 1. Simula el clic en el input invisible
  triggerFileInput() {
    if (this.fileInputElement) {
      this.fileInputElement.nativeElement.click();
    }
  }

  // 2. Procesa el archivo subido
  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string' && this.editorElement) {
        
        // Reemplazamos los saltos de línea (\n) por etiquetas <br> para que el HTML los respete
        const formattedContent = content.replace(/\n/g, '<br>');
        
        // Pegamos el contenido en el lienzo
        this.editorElement.nativeElement.innerHTML = formattedContent;
        
        // Disparamos manualmente el evento 'input' para que Angular y Firebase se enteren
        this.editorElement.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Movemos el cursor al final
        this.focusEditor();
        
        // Limpiamos el input para que permita subir el mismo archivo otra vez si se borra
        input.value = '';
      }
    };

    reader.onerror = () => {
      console.error("Error al leer el archivo");
      input.value = '';
    };

    // Leemos el archivo como texto puro (Perfecto para .txt y similares)
    reader.readAsText(file);
  }

  copyToClipboard() {
    if (this.isEmpty || !this.editorElement) return;

    // Solo obtenemos el texto
    const textToCopy = this.editorElement.nativeElement.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.isCopied = true;
      this.cdr.detectChanges(); // Angular pinta el Check al instante
      // Cuenta regresiva de 2 segundos exactos
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.detectChanges();
      }, 2000);
    }).catch(err => {
      console.error("Error al copiar al portapapeles:", err);
    });
  }

  openClearModal() {
    if (this.isEmpty) return;
    this.showClearModal = true;
  }

  cancelClear() {
    this.showClearModal = false;
  }

  confirmClear() {
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = '';
      this.editorElement.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.showClearModal = false;
      this.focusEditor();
    }
  }

  openDownloadModal() {
    if (this.isEmpty) return;
    this.showDownloadModal = true;
    this.selectedFormat = 'TEXT'; // Restablecer el formato por defecto
  }

  closeDownloadModal() {
    this.showDownloadModal = false;
  }

  selectDownloadFormat(format: 'TEXT' | 'PDF' | 'WORD') {
    this.selectedFormat = format;
  }

  executeDownload() {
    if (!this.editorElement || this.isEmpty) return;
    
    const activeNote = this.noteService.getActiveNote();
    let fileName = activeNote ? activeNote.titulo : 'Untitled Document';
    fileName = fileName.replace(/[\\/:*?"<>|]/g, '');

    if (this.selectedFormat === 'PDF') {
      // Tomamos el HTML y le limpiamos los caracteres invisibles
      let rawHtml = this.editorElement.nativeElement.innerHTML;
      rawHtml = rawHtml.replace(/&#8203;/g, '').replace(/\u200B/g, '');

      // Convertimos el HTML a comandos de dibujo para el PDF
      const pdfMakeContent = htmlToPdfmake(rawHtml, { window: window });

      // Configuramos la hoja
      const docDefinition = {
        content: pdfMakeContent,
        defaultStyle: {
          fontSize: 12
        },
        pageMargins: [ 40, 40, 40, 40 ] // Márgenes estéticos
      };

      // Se genera el PDF real y se lanza la descarga
      pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
      
      this.closeDownloadModal();
      return; 
    }

    // TXT O WORD
    const rawText = this.editorElement.nativeElement.innerText;
    let contentToDownload = rawText;
    let mimeType = 'text/plain';
    let extension = '.txt';

    if (this.selectedFormat === 'WORD') {
      const htmlContent = this.editorElement.nativeElement.innerHTML;
      contentToDownload = `<html><head><meta charset='utf-8'></head><body>${htmlContent}</body></html>`;
      mimeType = 'application/msword';
      extension = '.doc';
    }

    const blob = new Blob([contentToDownload], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.closeDownloadModal();
  }

  focusEditor() {
    if (!this.editorElement) return;
    const el = this.editorElement.nativeElement;

    if (document.activeElement === el) {
      return; 
    }

    el.focus();

    if (el.innerText.trim().length > 0) {
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}