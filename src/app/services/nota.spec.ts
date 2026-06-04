import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotaService } from './nota';

describe('NotaService', () => {
  let servicio: NotaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule] 
    });
    servicio = TestBed.inject(NotaService);
  });

  it('should be created', () => {
    expect(servicio).toBeTruthy();
  });
});