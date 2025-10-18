import { TestBed } from '@angular/core/testing';

import { FirebaseAfroshopService } from './firebase-afroshop.service';

describe('FirebaseAfroshopService', () => {
  let service: FirebaseAfroshopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseAfroshopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
