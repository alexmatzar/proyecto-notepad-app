import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent {
  @Input() activeView: string = 'notes';
  @Input() isPinned: boolean = false;
  @Output() viewChange = new EventEmitter<string>();
  showMore= false;

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