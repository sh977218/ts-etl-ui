import { Component, Input } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { LoadVersionRulesComponent } from '../load-version-rules/load-version-rules.component';
import { LoadSummary } from '../model/load-version';
import { EasternTimePipe } from '../service/eastern-time.pipe';

@Component({
  selector: 'app-load-summary',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    LoadVersionRulesComponent,
    EasternTimePipe,
  ],
  templateUrl: './load-summary.component.html',
  providers: [],
})
export class LoadSummaryComponent {
  @Input() loadSummary!: LoadSummary;
  summaryColumns: string[] = ['componentName', 'status', 'startTime', 'duration', 'error', 'warning', 'info'];
}
