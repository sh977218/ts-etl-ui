import { Component, Input } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoadSummary } from '../model/load-version';
import { DurationPipe } from '../service/app.pipe';
import { LoadVersionQaRulesComponent } from '../load-version-qa-rules/load-version-qa-rules.component';

@Component({
  selector: 'app-load-summary',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    DurationPipe,
    LoadVersionQaRulesComponent,
  ],
  templateUrl: './load-summary.component.html',
  providers: [DurationPipe],
})
export class LoadSummaryComponent {
  @Input() loadSummary!: LoadSummary;
  summaryColumns: string[] = ['componentName', 'status', 'startTime', 'duration', 'error', 'warning', 'info'];
}
