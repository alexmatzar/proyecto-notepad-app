import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() activeView: string = 'notes';
  @Input() isPinned: boolean = false;
  @Output() viewChange = new EventEmitter<string>();

  isHovered = false;

  get isPanelOpen(): boolean {
    return this.isPinned || this.isHovered;
  }

  setView(view: string) {
    this.viewChange.emit(view);
  }

  onMouseEnter() { this.isHovered = true; }
  onMouseLeave() { this.isHovered = false; }
}