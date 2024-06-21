import { Component, Input } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoadSummary } from '../model/version-qa';
import { DurationPipe } from '../service/app.pipe';

@Component({
  selector: 'app-load-summary',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    DurationPipe,
  ],
  templateUrl: './load-summary.component.html',
  providers: [DurationPipe]
})
export class LoadSummaryComponent  {
  @Input() loadSummary!: LoadSummary;
  summaryColumns: string[] = ['componentName', 'status', 'startTime', 'duration', 'error', 'warning', 'info'];
  rulesColumns = ['type', 'total', 'withDate', 'error', 'warning', 'info'];

}
