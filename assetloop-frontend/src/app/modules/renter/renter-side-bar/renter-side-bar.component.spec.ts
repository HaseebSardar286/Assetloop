import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenterSideBarComponent } from './renter-side-bar.component';

describe('RenterSideBarComponent', () => {
  let component: RenterSideBarComponent;
  let fixture: ComponentFixture<RenterSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenterSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenterSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
