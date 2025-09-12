import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInfoPanelComponent } from './chat-info-panel.component';

describe('ChatInfoPanelComponent', () => {
  let component: ChatInfoPanelComponent;
  let fixture: ComponentFixture<ChatInfoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInfoPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
