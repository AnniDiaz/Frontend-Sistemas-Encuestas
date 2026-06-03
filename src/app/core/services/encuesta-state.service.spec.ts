import { TestBed } from '@angular/core/testing';

import { EncuestaStateService } from './encuesta-state.service';

describe('EncuestaStateService', () => {
  let service: EncuestaStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncuestaStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
