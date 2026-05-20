import { Component } from '@angular/core';
import { EditorToolbarComponent } from '../components/editor-toolbar/editor-toolbar';
import { WritingCanvasComponent } from '../components/writing-canvas/writing-canvas';

@Component({
  selector: 'app-editor-notas',
  imports: [EditorToolbarComponent, WritingCanvasComponent],
  templateUrl: './editor-notas.html',
  styleUrl: './editor-notas.css'
})
export class EditorNotasComponent {}