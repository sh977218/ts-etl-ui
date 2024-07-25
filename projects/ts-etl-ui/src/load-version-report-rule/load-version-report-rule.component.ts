import { ChangeDetectionStrategy, Component, computed, effect, input, ViewChild } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { tap } from 'rxjs';
import { RuleUI } from '../model/load-version';

@Component({
  selector: 'app-load-version-report-rule',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    CdkCopyToClipboard,
  ],
  templateUrl: './load-version-report-rule.component.html',
  styleUrl: './load-version-report-rule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportRuleComponent {
  verificationQARules = input.required<RuleUI[]>();

  dataSource = computed(() => {
    const dataSource = new MatTableDataSource(this.verificationQARules());
    dataSource.filterPredicate = (data: RuleUI) => {
      const nameMatched = data.name.toLowerCase().includes((this.searchCriteria.getRawValue().name || '').toLowerCase());
      const descriptionMatched = data.description.toLowerCase().includes((this.searchCriteria.getRawValue().description || '').toLowerCase());
      return nameMatched && descriptionMatched;
    };
    return dataSource;
  });
  verificationQARulesColumn = [
    'name', 'description', 'dataAvailable', 'messagesGroupCount', 'action',
  ];

  searchRowColumns = ['name-search', 'description-search', 'dataAvailable-search', 'numberOfError', 'numberOfWarning', 'numberOfInfo', 'empty'];

  searchCriteria = new FormGroup(
    {
      name: new FormControl<string | undefined>(undefined),
      description: new FormControl<string | undefined>(undefined),
      dataAvailable: new FormControl<Date | undefined>(undefined),
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
