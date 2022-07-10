import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AccountdetailsPage } from './accountdetails.page';

describe('AccountdetailsPage', () => {
  let component: AccountdetailsPage;
  let fixture: ComponentFixture<AccountdetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountdetailsPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
