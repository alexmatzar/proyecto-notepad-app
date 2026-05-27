import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-writing-canvas',
  standalone: true,
  imports: [],
  templateUrl: './writing-canvas.html',
  styleUrl: './writing-canvas.css'
})
export class WritingCanvasComponent {
  // Estado que controla si mostramos el texto y el botón
  isEmpty: boolean = true;

  @ViewChild('editor') editorElement!: ElementRef;

  onInput(event: Event) {
    const target = event.target as HTMLElement;
    // .trim() ignora los saltos de línea (<br>) o espacios vacíos
    const content = target.innerText.trim();
    this.isEmpty = content.length === 0;
  }

  // Si hacen clic en el área del texto falso, enfocamos el editor real
  focusEditor() {
    if (this.editorElement) {
      this.editorElement.nativeElement.focus();
    }
  }
}