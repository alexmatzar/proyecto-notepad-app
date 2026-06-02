import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorNotas } from './editor-notas';

describe('EditorNotas', () => {
  let component: EditorNotas;
  let fixture: ComponentFixture<EditorNotas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorNotas],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorNotas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
