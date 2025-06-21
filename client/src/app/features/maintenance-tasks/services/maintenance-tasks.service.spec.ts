import { TestBed } from '@angular/core/testing';

import { MaintenanceTasksService } from './maintenance-tasks.service';

describe('MaintenanceTasksService', () => {
  let service: MaintenanceTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintenanceTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
