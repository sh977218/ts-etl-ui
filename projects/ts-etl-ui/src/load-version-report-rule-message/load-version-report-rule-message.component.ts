import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RuleMessageUI } from '../model/load-version';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';

@Component({
  selector: 'app-load-version-report-rule-message',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
  ],
  templateUrl: './load-version-report-rule-message.component.html',
  styleUrl: './load-version-report-rule-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportRuleMessageComponent {
  verificationRuleMessages = input.required<RuleMessageUI[]>();
  dataSource = computed(() => new MatTableDataSource(this.verificationRuleMessages()));

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

  constructor() {
    this.searchCriteria.valueChanges.pipe(tap({ next: () => this.applyFilter() })).subscribe();
  }

  applyFilter() {
    this.dataSource().filter = this.searchCriteria.getRawValue().message || '';
  }
}
