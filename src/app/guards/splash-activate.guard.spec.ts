import { TestBed } from '@angular/core/testing';

import { SplashActivateGuard } from './splash-activate.guard';

describe('SplashActivateGuard', () => {
  let guard: SplashActivateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SplashActivateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
