import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-top-nav',
  imports: [],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css'
})
export class TopNavComponent {
  @Output() hamburgerClick = new EventEmitter<void>();

  onHamburger() {
    this.hamburgerClick.emit();
  }
}