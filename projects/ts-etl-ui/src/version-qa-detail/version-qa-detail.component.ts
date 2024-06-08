import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common'
import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { MatButtonModule } from "@angular/material/button"
import { MatTableModule } from '@angular/material/table'
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { MatCardModule } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { EMPTY, map, switchMap, tap } from 'rxjs'

import {
    VersionQaReviewDataReturn,
    VersionQaReviewModalComponent,
} from '../version-qa-review-modal/version-qa-review-modal.component';
import {
    VersionQaSourceDataFileModalComponent
} from '../version-qa-source-data-file-modal/version-qa-source-data-file-modal.component'
import type { VersionQA, VersionQAActivityHistory } from '../model/version-qa'
import { triggerExpandTableAnimation } from "../animations";
import { MatIcon } from "@angular/material/icon";

export interface RowElement {
    label: string;
    key: string;
    value: string | number | Date | VersionQAActivityHistory[];
}

@Component({
    selector: 'app-version-qa-detail',
    standalone: true,
    animations: [triggerExpandTableAnimation],
    imports: [
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        MatDialogModule,
        MatButtonModule,
        MatTableModule,
        MatCardModule,
        MatDivider,
        VersionQaReviewModalComponent,
        MatIcon,
        NgIf
    ],
    templateUrl: './version-qa-detail.component.html'
})
export class VersionQaDetailComponent implements OnInit {
    @Input() data!: VersionQA;

    displayedColumns: string[] = ["key", "value"];
    qaActivityColumns: string[] = ['sequence', 'action', 'updatedTime', 'nbNotes'];
    notesColumns: string[] = ['tags', 'notes', 'createdBy', 'createdTime', 'action'];
    dataSource: RowElement[] = [];
    qaActivityHistory: WritableSignal<VersionQAActivityHistory[]> = signal([]);
    expandedActivity: VersionQAActivityHistory | null = null;

    constructor(
        public dialog: MatDialog,
        private http: HttpClient,
    ) {
    }

    initDataSource() {
        this.dataSource = Object.keys(this.data)
            .filter(k => !['activityHistory'].includes(k)) // do not show 'activityHistory'//
            .map(key => ({
                label: key.toUpperCase(),
                key: key,
                value: this.data[key as keyof VersionQA]
            }));
        this.qaActivityHistory.set(this.data.activityHistory);
    }

    ngOnInit() {
        this.initDataSource();
    }

    action(action: 'Accept' | 'Reject') {
        this.dialog
            .open(VersionQaReviewModalComponent, {
                width: '600px',
                data: {tag: action}
            })
            .afterClosed()
            .pipe(
                // transform the data return from modal to `VersionQAActivityHistory`
                map((versionQaReviewDataReturn: VersionQaReviewDataReturn | null) => {
                    if (versionQaReviewDataReturn) {
                        const {action, ...note} = versionQaReviewDataReturn;
                        return {
                            action,
                            updatedTime: new Date(),
                            notes: [note]
                        } as VersionQAActivityHistory;
                    } else {
                        // if user click close button, 'versionQaReviewDataReturn' is null/undefined
                        return null
                    }
                }),
                switchMap((versionQAActivityHistory: VersionQAActivityHistory | null) => {
                    if (versionQAActivityHistory) {
                        return this.http.post('/api/qaActivity', {
                            requestId: this.data.requestId,
                            qaActivity: versionQAActivityHistory
                        })
                            .pipe(
                                /**
                                 * because this http post doesn't return any data,
                                 * but we need to pass the input from switchMap to next pipe,
                                 * so we can update the UI without fetch the entire array again
                                 */

                                map(() => versionQAActivityHistory)
                            )
                    } else {
                        // if user click close button, we pass empty to next
                        return EMPTY;
                    }
                }),
                tap({
                    next: (versionQAActivityHistory) => {
                        if (versionQAActivityHistory) {
                            this.data.activityHistory = [...this.data.activityHistory, versionQAActivityHistory];
                            this.qaActivityHistory.update(versionQAActivityHistories => {
                                versionQAActivityHistories.push(versionQAActivityHistory);
                                return versionQAActivityHistories;
                            })
                            this.initDataSource();
                        }
                    }
                })
            )
            // intentionally make `.subscribe() to be an empty, so using AsyncPipe (`| async`) in the HTML becomes very easy in future
            .subscribe();
    }

    openSourceDataFileModal() {
        this.dialog.open(VersionQaSourceDataFileModalComponent, {
            width: '600px',
            data: this.data.version
        })
            .afterClosed()
            .subscribe();
    }

}
