import { AsyncPipe, KeyValuePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

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
  summary = [
    {
      summary: 'Code System Name',
      thisVersion: 'CDT',
      previousVersion: 'CDT',
      difference: '',
    },
    {
      summary: 'Version',
      thisVersion: '2023',
      previousVersion: '2022',
      difference: '',
    },
    {
      summary: 'Load Number',
      thisVersion: '2023100201003',
      previousVersion: '20230928102341',
      difference: '',
    },
    {
      summary: 'Total number of codes',
      thisVersion: 897,
      previousVersion: 874,
      difference: 23,
    },
    {
      summary: 'Number of active codes',
      thisVersion: 895,
      previousVersion: 869,
      difference: 26,
      indent: true,
    },
    {
      summary: 'Number of inactive codes',
      thisVersion: 2,
      previousVersion: 5,
      difference: -3,
      indent: true,
    },
    {
      summary: 'Total number of terms',
      thisVersion: 897,
      previousVersion: 874,
      difference: 23,
    },
    {
      summary: 'Total number of properties',
      thisVersion: 2406,
      previousVersion: 0,
      difference: 2406,
    },
    {
      summary: 'Total number of remap codes',
      thisVersion: 0,
      previousVersion: 0,
      difference: 0,
    },
    {
      summary: 'Total number of hierarchies',
      thisVersion: 885,
      previousVersion: 862,
      difference: 23,
    },
    {
      summary: 'Total number of terms',
      thisVersion: 897,
      previousVersion: 874,
      difference: 23,
    },
    {
      summary: 'Total number of transitive closures',
      thisVersion: 2654,
      previousVersion: 2571,
      difference: 83,
    },
    {
      summary: 'Total number of relationships',
      thisVersion: 0,
      previousVersion: 0,
      difference: 0,
    },
    {
      summary: 'Total number of attributes',
      thisVersion: 3644,
      previousVersion: 3621,
      difference: 23,
    },
  ];

  summaryDataSource = new MatTableDataSource(this.summary);

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

}
