import { TestBed } from '@angular/core/testing';

import { ZcatService } from './zcat.service';

describe('ZcatService', () => {
  let service: ZcatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZcatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
