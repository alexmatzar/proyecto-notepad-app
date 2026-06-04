import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarraSupComponent } from './barra-sup';

describe('BarraSupComponent', () => {
  let component: BarraSupComponent;
  let fixture: ComponentFixture<BarraSupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraSupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraSupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});