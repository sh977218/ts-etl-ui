import { ChangeDetectionStrategy, Component, computed, effect, input, ViewChild } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { tap } from 'rxjs';

import { RuleMessageUI } from '../model/load-version';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-load-version-report-rule-message',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    NgForOf,
  ],
  templateUrl: './load-version-report-rule-message.component.html',
  styleUrl: './load-version-report-rule-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportRuleMessageComponent {
  verificationRuleMessages = input.required<RuleMessageUI[]>();
  dataSource = computed(() => {
    const dataSource = new MatTableDataSource(this.verificationRuleMessages());
    dataSource.filterPredicate = (data: RuleMessageUI) => {
      const nameMatched = data.name.toLowerCase().includes((this.searchCriteria.getRawValue().name || '').toLowerCase());
      const messageGroupMatched = !this.searchCriteria.getRawValue().messageGroup || data.messageGroup.toLowerCase().includes((this.searchCriteria.getRawValue().messageGroup || '').toLowerCase());
      const messageTypeMatched = !this.searchCriteria.getRawValue().messageType || data.messageType.toLowerCase().includes((this.searchCriteria.getRawValue().messageType || '').toLowerCase());
      const tagMatched = !this.searchCriteria.getRawValue().tag || data.tag.toLowerCase().includes((this.searchCriteria.getRawValue().tag || '').toLowerCase());
      const messageMatched = data.message.toLowerCase().includes((this.searchCriteria.getRawValue().message || '').toLowerCase());
      return nameMatched && messageGroupMatched && messageTypeMatched && tagMatched && messageMatched;
    };
    return dataSource;
  });

  messageGroups = computed(() => [...new Set(this.verificationRuleMessages().map(m => m.messageGroup))]);
  messageTypes = computed(() => [...new Set(this.verificationRuleMessages().map(m => m.messageType))]);
  tags = computed(() => [...new Set(this.verificationRuleMessages().map(m => m.tag))]);

  verificationRuleMessagesColumn = [
    'name',
    'messageGroup',
    'messageType',
    'tag',
    'message',
    'creationTime',
  ];

  searchRowColumns = this.verificationRuleMessagesColumn.map(c => `${c}-search`);

  searchCriteria = new FormGroup(
    {
      name: new FormControl<string | undefined>(undefined),
      messageGroup: new FormControl<string | undefined>(undefined),
      messageType: new FormControl<string | undefined>(undefined),
      tag: new FormControl<string | undefined>(undefined),
      message: new FormControl<string | undefined>(undefined, { updateOn: 'change' }),
      creationTime: new FormControl<Date | undefined>(undefined),
    }, { updateOn: 'change' },
  );

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    effect(() => {
      this.dataSource().paginator = this.paginator;
      this.dataSource().sort = this.sort;
    });
    this.searchCriteria.valueChanges.pipe(tap({ next: () => this.applyFilter() })).subscribe();
  }

  applyFilter() {
    // this line only triggers the filter event, but the 'filter' value is not actually used in 'filterPredicate'.
    this.dataSource().filter = this.searchCriteria.getRawValue().toString();

    if (this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

}
