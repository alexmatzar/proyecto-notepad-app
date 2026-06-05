import { Component } from '@angular/core';
import { EditorToolbarComponent } from '../editor-toolbar/editor-toolbar';

@Component({
  selector: 'app-editor-notas',
  imports: [EditorToolbarComponent],
  templateUrl: './editor-notas.html',
  styleUrl: './editor-notas.css',
})
export class EditorNotas {

  onToolbarCommand(command: string) {
    console.log('RECIBIDO:', command);
  }

}