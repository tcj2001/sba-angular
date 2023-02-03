import { Component } from '@angular/core';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-result-selector',
  templateUrl: './result-selector.component.html'
})
export class ResultSelectorComponent {

  code = `<sq-result-selector
    [record]="record">
</sq-result-selector>`;

  constructor(public globalService: GlobalService) { }

}
