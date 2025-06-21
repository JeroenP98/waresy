import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceTaskTableComponent } from './maintenance-task-table.component';

describe('MaintenanceTaskTableComponent', () => {
  let component: MaintenanceTaskTableComponent;
  let fixture: ComponentFixture<MaintenanceTaskTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceTaskTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceTaskTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
