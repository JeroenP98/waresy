import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceTaskAssetsTableComponent } from './maintenance-task-assets-table.component';

describe('MaintenanceTaskAssetsTableComponent', () => {
  let component: MaintenanceTaskAssetsTableComponent;
  let fixture: ComponentFixture<MaintenanceTaskAssetsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceTaskAssetsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceTaskAssetsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
