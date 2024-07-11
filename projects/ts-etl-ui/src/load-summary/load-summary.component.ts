import { Component, Input } from '@angular/core';
import {
  MatTableModule,
} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoadSummary } from '../model/load-version';
import { DurationPipe } from '../service/app.pipe';
import { LoadVersionRulesComponent } from '../load-version-rules/load-version-rules.component';

@Component({
  selector: 'app-load-summary',
  standalone: true,
  imports: [
    MatSortModule,
    MatTableModule,
    DurationPipe,
    LoadVersionRulesComponent,
  ],
  templateUrl: './load-summary.component.html',
  providers: [DurationPipe],
})
export class LoadSummaryComponent {
  @Input() loadSummary!: LoadSummary;
  summaryColumns: string[] = ['componentName', 'status', 'startTime', 'duration', 'error', 'warning', 'info'];
}
