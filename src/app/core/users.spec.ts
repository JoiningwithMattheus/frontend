import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { UsersService } from './users';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
