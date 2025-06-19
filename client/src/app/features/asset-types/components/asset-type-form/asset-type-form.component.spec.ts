import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTypeFormComponent } from './asset-type-form.component';

describe('AssetTypeFormComponent', () => {
  let component: AssetTypeFormComponent;
  let fixture: ComponentFixture<AssetTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetTypeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
