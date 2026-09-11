import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EscuelaService } from './escuela.service';

describe('EscuelaService', () => {
  let service: EscuelaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EscuelaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
