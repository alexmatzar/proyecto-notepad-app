import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const accesorio = TestBed.createComponent(App);
    const aplicacion = accesorio.componentInstance;
    expect(aplicacion).toBeTruthy();
  });

  it('should render title', async () => {
    const accesorio = TestBed.createComponent(App);
    await accesorio.whenStable();
    const compilado = accesorio.nativeElement as HTMLElement;
    expect(compilado.querySelector('h1')?.textContent).toContain('Hello, notepad-app');
  });
});