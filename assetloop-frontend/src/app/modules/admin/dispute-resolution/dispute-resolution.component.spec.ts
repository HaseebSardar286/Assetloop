import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisputeResolutionComponent } from './dispute-resolution.component';

describe('DisputeResolutionComponent', () => {
  let component: DisputeResolutionComponent;
  let fixture: ComponentFixture<DisputeResolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisputeResolutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisputeResolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
