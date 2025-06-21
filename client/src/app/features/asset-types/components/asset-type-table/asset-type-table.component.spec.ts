import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTypeTableComponent } from './asset-type-table.component';

describe('AssetTypeTableComponent', () => {
  let component: AssetTypeTableComponent;
  let fixture: ComponentFixture<AssetTypeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetTypeTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
