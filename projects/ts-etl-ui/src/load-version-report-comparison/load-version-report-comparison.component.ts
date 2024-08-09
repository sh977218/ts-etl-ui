import { AsyncPipe, KeyValuePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, forkJoin, map, switchMap } from 'rxjs';

import { environment } from '../environments/environment';
import { VersionStatus, VersionStatusMeta } from '../model/code-system';

@Component({
  selector: 'app-load-version-report-comparison',
  standalone: true,
  imports: [
    AsyncPipe,
    KeyValuePipe,
    NgForOf,
    NgIf,
    MatTableModule,
    NgClass,
  ],
  templateUrl: './load-version-report-comparison.component.html',
  styleUrl: './load-version-report-comparison.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadVersionReportComparisonComponent {
  codeSystemName = input.required<string>();

  summaryDataSource =
    toObservable(this.codeSystemName).pipe(
      catchError(() => []),
      switchMap((codeSystemName: string) => {
        return this.http.get<VersionStatusMeta>(`${environment.apiServer}/versionStatusMeta/${codeSystemName}`)
          .pipe(
            catchError(() => []),
            switchMap((versionStatusMeta: VersionStatusMeta) => {
              return forkJoin([
                this.http.get<VersionStatus>(`${environment.apiServer}/versionStatus/${versionStatusMeta.codeSystemName}/${versionStatusMeta.currentVersion}`)
                  .pipe(
                    map((versionStatus: VersionStatus) => versionStatus!.summary),
                  ),
                this.http.get<VersionStatus>(`${environment.apiServer}/versionStatus/${versionStatusMeta.codeSystemName}/${versionStatusMeta.priorVersion}`)
                  .pipe(
                    map((versionStatus: VersionStatus) => versionStatus.summary),
                  ),
              ])
                .pipe(catchError(() => []),
                );
            }),
            map(([currentVersionSummary, priorVersionSummary]) => {
              const versionSummary = [];
              if (!currentVersionSummary || !priorVersionSummary) return [];
              for (const [k, currentV] of Object.entries(currentVersionSummary)) {
                const prior = Object.entries(currentVersionSummary).find((o) => {
                  return o[0] === k;
                });
                const priorV = prior ? prior[1] : '';
                const result = {
                  summary: k,
                  thisVersion: currentV,
                  previousVersion: priorV,
                  difference: (typeof currentV === 'number' && typeof priorV === 'number') ? (currentV - priorV) : '',
                  indent: ['Number of active codes', 'Number of inactive codes'].includes(k),
                };
                versionSummary.push(result);
              }
              return versionSummary;
            }),
          );
      }),
    );

  summaryColumn = ['summary', 'thisVersion', 'previousVersion', 'difference'];

  dataType = [
    {
      dataType: 'Code',
      change: 'Total number of new codes',
      thisVersion: 50,
      action: 'View New Codes',
    },
    {
      dataType: '',
      change: 'Number of new codes - active',
      thisVersion: 50,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of new codes - inactive',
      thisVersion: 50,
      indent: true,
    },
    {
      dataType: '',
      change: 'Total number of retired codes',
      thisVersion: 27,
      action: 'View Retired Codes',
    },
    {
      dataType: '',
      change: 'Number of retired codes - active',
      thisVersion: 22,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of retired codes - inactive',
      thisVersion: 5,
      indent: true,
    },
    {
      dataType: '',
      change: 'Total number of codes with status change',
      thisVersion: 2,
      action: 'View Codes with Status Change',
    },
    {
      dataType: '',
      change: 'Number of codes becoming active',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of codes becoming inactive',
      thisVersion: 2,
      indent: true,
    },
    {
      dataType: 'Term',
      change: 'Total number of term types (TTY)',
      thisVersion: 3,
      action: 'View Term Types',
    },
    {
      dataType: '',
      change: 'Number of new  term types',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of removed term types',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: 'Property',
      change: 'Total number of property names',
      thisVersion: 6,
      action: 'View Property Names',
    },
    {
      dataType: '',
      change: 'Number new property names',
      thisVersion: 6,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of removed property names',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: 'Remap',
      change: 'Total number of new remap codes',
      thisVersion: 0,
      action: 'View New/Removed Remap Codes',
    },
    {
      dataType: '',
      change: 'Total number removed  remap codes',
      thisVersion: 6,
    },
    {
      dataType: 'Relationship',
      change: 'Total number of relationship types',
      thisVersion: 3,
      action: 'View Relationship Types',
    },
    {
      dataType: '',
      change: 'Number of new relationship types',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of removed relationship types',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: 'Attribute',
      change: 'Total number of attribute names',
      thisVersion: 15,
      action: 'View Attribute Names',
    },
    {
      dataType: '',
      change: 'Number of new attribute names',
      thisVersion: 0,
      indent: true,
    },
    {
      dataType: '',
      change: 'Number of removed attribute names',
      thisVersion: 0,
      indent: true,
    },
  ];

  dataTypeDataSource = new MatTableDataSource(this.dataType);

  dataTypeColumn = ['dataType', 'change', 'thisVersion', 'action'];

  constructor(private http: HttpClient) {
  }

}
