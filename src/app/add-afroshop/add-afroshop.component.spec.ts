import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAfroshopComponent } from './add-afroshop.component';

describe('AddAfroshopComponent', () => {
  let component: AddAfroshopComponent;
  let fixture: ComponentFixture<AddAfroshopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAfroshopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAfroshopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
