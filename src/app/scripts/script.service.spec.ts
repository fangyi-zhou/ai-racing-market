import { TestBed, inject } from '@angular/core/testing';

import { ScriptFetcherService } from './script.service';

describe('ScriptFetcherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScriptFetcherService]
    });
  });

  it('should be created', inject([ScriptFetcherService], (service: ScriptFetcherService) => {
    expect(service).toBeTruthy();
  }));
});
