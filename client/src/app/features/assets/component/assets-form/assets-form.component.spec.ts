import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsFormComponent } from './assets-form.component';

describe('AssetsFormComponent', () => {
  let component: AssetsFormComponent;
  let fixture: ComponentFixture<AssetsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
