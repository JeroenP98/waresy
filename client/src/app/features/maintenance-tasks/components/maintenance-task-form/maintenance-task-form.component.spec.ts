import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceTaskFormComponent } from './maintenance-task-form.component';

describe('MaintenanceTaskFormComponent', () => {
  let component: MaintenanceTaskFormComponent;
  let fixture: ComponentFixture<MaintenanceTaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceTaskFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceTaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
