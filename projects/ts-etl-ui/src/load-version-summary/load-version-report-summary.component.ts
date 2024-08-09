import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

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
    MatButtonModule,
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
