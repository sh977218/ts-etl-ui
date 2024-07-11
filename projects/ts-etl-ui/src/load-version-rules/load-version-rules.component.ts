import { AfterViewInit, Component, Input } from '@angular/core';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoadRule } from '../model/load-version';

@Component({
  selector: 'app-load-version-rules',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './load-version-rules.component.html',
})
export class LoadVersionRulesComponent implements AfterViewInit {
  @Input() qaRules!: LoadRule[];
  rulesColumns = ['type', 'total', 'withData', 'error', 'warning', 'info'];
  rulesData: {
    type: string;
    total: number;
    withData: number;
    errors: number;
    warnings: number
    infos: number;
  }[] = [{
    type: 'Verification',
    total: 0,
    withData: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
  }, {
    type: 'Validation',
    total: 0,
    withData: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
  }];
  datasource = new MatTableDataSource(this.rulesData);

  ngAfterViewInit(): void {
    if (this.qaRules) {
      this.qaRules.forEach(r => {
        const index = r.type === 'Verification' ? 0 : 1;
        this.rulesData[index].total++;
        if (r.error) this.rulesData[index].errors++;
        if (r.warning) this.rulesData[index].warnings++;
        if (r.info) this.rulesData[index].infos++;
      });
    }
  }

}
