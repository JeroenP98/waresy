import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceTaskHistoryTableComponent } from './maintenance-task-history-table.component';

describe('MaintenanceTaskHistoryTableComponent', () => {
  let component: MaintenanceTaskHistoryTableComponent;
  let fixture: ComponentFixture<MaintenanceTaskHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceTaskHistoryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceTaskHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
