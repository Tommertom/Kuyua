import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrutPage } from './prut.page';

describe('PrutPage', () => {
  let component: PrutPage;
  let fixture: ComponentFixture<PrutPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrutPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
