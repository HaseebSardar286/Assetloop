import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchListingsComponent } from './search-listings.component';

describe('SearchListingsComponent', () => {
  let component: SearchListingsComponent;
  let fixture: ComponentFixture<SearchListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
