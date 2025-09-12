import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestedAssetsComponent } from './requested-assets.component';

describe('RequestedAssetsComponent', () => {
  let component: RequestedAssetsComponent;
  let fixture: ComponentFixture<RequestedAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestedAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestedAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
