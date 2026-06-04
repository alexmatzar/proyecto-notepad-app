import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorNotasComponent } from './editor-notas';

describe('EditorNotasComponent', () => {
  let componente: EditorNotasComponent;
  let accesorio: ComponentFixture<EditorNotasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorNotasComponent],
    }).compileComponents();

    accesorio = TestBed.createComponent(EditorNotasComponent);
    componente = accesorio.componentInstance;
    await accesorio.whenStable();
  });

  it('should create', () => {
    expect(componente).toBeTruthy();
  });
});