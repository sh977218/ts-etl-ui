import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoadSummary } from '../model/load-version';
import { LoadVersionRulesComponent } from '../load-version-rules/load-version-rules.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-load-summary',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    LoadVersionRulesComponent,
    DatePipe,
  ],
  templateUrl: './load-summary.component.html',
  providers: [],
})
export class LoadSummaryComponent {
  @Input() loadSummary!: LoadSummary;
  summaryColumns: string[] = ['componentName', 'status', 'startTime', 'duration', 'error', 'warning', 'info'];
}
