import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Summary } from '../model/load-version';

@Component({
  selector: 'app-load-version-summary',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatTableModule,
    MatInputModule,
    CdkCopyToClipboard,
  ],
  templateUrl: './load-version-report-summary.component.html',
  styleUrl: './load-version-report-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportSummaryComponent {
  summary = input.required<Summary[]>();
  dataSource = computed(() => new MatTableDataSource(this.summary()));

  summaryColumn = [
    'totalRules', 'rulesWithData', 'messagesGroupCount', 'action',
  ];
  summaryRowColumns = ['empty', 'empty', 'numberOfError', 'numberOfWarning', 'numberOfInfo', 'empty'];

}
