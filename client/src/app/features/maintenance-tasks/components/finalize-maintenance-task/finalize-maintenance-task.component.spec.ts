import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeMaintenanceTaskComponent } from './finalize-maintenance-task.component';

describe('FinalizeMaintenanceTaskComponent', () => {
  let component: FinalizeMaintenanceTaskComponent;
  let fixture: ComponentFixture<FinalizeMaintenanceTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalizeMaintenanceTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalizeMaintenanceTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
