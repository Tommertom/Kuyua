import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContactsellersPage } from './contactsellers.page';

describe('ContactsellersPage', () => {
  let component: ContactsellersPage;
  let fixture: ComponentFixture<ContactsellersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsellersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsellersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
