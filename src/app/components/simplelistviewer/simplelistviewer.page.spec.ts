import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SimplelistviewerPage } from './simplelistviewer.page';

describe('SimplelistviewerPage', () => {
  let component: SimplelistviewerPage;
  let fixture: ComponentFixture<SimplelistviewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimplelistviewerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SimplelistviewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
