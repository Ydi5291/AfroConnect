import { TestBed } from '@angular/core/testing';

import { AfroshopService } from './image.service';

describe('AfroshopService', () => {
  let service: AfroshopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AfroshopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
