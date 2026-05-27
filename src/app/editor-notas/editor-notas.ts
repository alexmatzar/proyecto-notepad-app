import { Component } from '@angular/core';
import { EditorToolbarComponent } from './editor-toolbar/editor-toolbar';
import { WritingCanvasComponent } from './writing-canvas/writing-canvas';

@Component({
  selector: 'app-editor-notas',
  standalone: true,
  imports: [EditorToolbarComponent, WritingCanvasComponent],
  templateUrl: './editor-notas.html',
  styleUrl: './editor-notas.css'
})
export class EditorNotasComponent {}