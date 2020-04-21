import { TestBed } from '@angular/core/testing';

import { DepValidationService } from './dep-validation.service';

describe('DepValidationService', () => {
  let service: DepValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
