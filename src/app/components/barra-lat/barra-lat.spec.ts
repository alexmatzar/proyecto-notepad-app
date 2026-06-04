import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraLatComponent } from './barra-lat';

describe('BarraLatComponent', () => {
  let component: BarraLatComponent;
  let fixture: ComponentFixture<BarraLatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLatComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraLatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});