import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './editor-toolbar.html',
  styleUrl: './editor-toolbar.css'
})
export class EditorToolbarComponent {

  @Output()
  command = new EventEmitter<string>();
emitCommand(cmd: string) {
  alert(cmd);
  console.log('Toolbar envió:', cmd);
  this.command.emit(cmd);
}

}