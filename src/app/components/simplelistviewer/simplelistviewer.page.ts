import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-simplelistviewer',
  templateUrl: './simplelistviewer.page.html',
  styleUrls: ['./simplelistviewer.page.scss'],
})
export class SimplelistviewerPage implements OnInit {

  @Input() simpleobject;

  itemList: { key: string, value: string }[] = [];

  constructor() { }

  ngOnInit() {
    this.itemList = [];
    if (this.simpleobject) {
      Object.keys(this.simpleobject).forEach(key => {
        this.itemList.push({
          key, value: this.simpleobject[key]
        });
      });
    } else {
      console.warn('Weird object received', this.simpleobject);
    }
  }
}
