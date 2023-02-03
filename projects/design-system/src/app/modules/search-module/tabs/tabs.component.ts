import { Component } from '@angular/core';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html'
})
export class TabsComponent {

  code = `<sq-tabs
    [results]="results">
</sq-tabs>`;

  constructor(public globalService: GlobalService) { }

}
