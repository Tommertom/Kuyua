import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContactbuyersPage } from './contactbuyers.page';

describe('ContactbuyersPage', () => {
  let component: ContactbuyersPage;
  let fixture: ComponentFixture<ContactbuyersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactbuyersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactbuyersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
