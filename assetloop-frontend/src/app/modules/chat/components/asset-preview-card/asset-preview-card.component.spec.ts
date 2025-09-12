import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetPreviewCardComponent } from './asset-preview-card.component';

describe('AssetPreviewCardComponent', () => {
  let component: AssetPreviewCardComponent;
  let fixture: ComponentFixture<AssetPreviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetPreviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetPreviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
