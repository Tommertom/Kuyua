import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WelcomewizardPage } from './welcomewizard.page';

describe('WelcomewizardPage', () => {
  let component: WelcomewizardPage;
  let fixture: ComponentFixture<WelcomewizardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomewizardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomewizardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
