import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerSideBarComponent } from './owner-side-bar.component';

describe('OwnerSideBarComponent', () => {
  let component: OwnerSideBarComponent;
  let fixture: ComponentFixture<OwnerSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
