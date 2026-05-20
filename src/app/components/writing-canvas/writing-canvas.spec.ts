import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WritingCanvas } from './writing-canvas';

describe('WritingCanvas', () => {
  let component: WritingCanvas;
  let fixture: ComponentFixture<WritingCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WritingCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(WritingCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
