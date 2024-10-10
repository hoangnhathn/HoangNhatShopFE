import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideAdminComponent } from './slide-admin.component';

describe('SlideAdminComponent', () => {
  let component: SlideAdminComponent;
  let fixture: ComponentFixture<SlideAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlideAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
