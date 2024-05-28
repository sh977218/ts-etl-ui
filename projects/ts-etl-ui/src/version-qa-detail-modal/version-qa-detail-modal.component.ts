import {NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common'
import {Component, Inject} from '@angular/core'
import {MatButtonModule} from "@angular/material/button"
import {MatTableModule} from '@angular/material/table'
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog"
import {MatCardModule} from "@angular/material/card";

import type {VersionQA} from '../model/version-qa'
import {MatDivider} from "@angular/material/divider";

export interface RowElement {
  label: string;
  key: string;
  value: string | number | Date;
}

@Component({
  selector: 'app-version-qa-detail-modal',
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatDivider
  ],
  templateUrl: './version-qa-detail-modal.component.html'
})
export class VersionQaDetailModalComponent {
  displayedColumns: string[] = ["key", "value"];

  dataSource: RowElement[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: VersionQA) {
    this.dataSource = Object.keys(data).map(key => ({
      label: key.toUpperCase(),
      key: key,
      value: data[key as keyof VersionQA]
    }))
  }
}
