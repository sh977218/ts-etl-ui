import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA, signal,
    ViewChild, WritableSignal
} from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { saveAs } from 'file-saver';

import { MatTableModule, } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoadRequestDataSource } from './load-request-data-source';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { catchError, map, merge, of, startWith, switchMap } from 'rxjs';

import { LoadRequest, LoadRequestsApiResponse } from '../model/load-request';
import { AlertService } from '../alert-service';
import { LoadRequestActivityComponent } from '../load-request-activity/load-request-activity.component';
import { CreateLoadRequestModalComponent } from '../create-load-request-modal/create-load-request-modal.component';
import { LoadingService } from "../loading-service";

@Component({
    selector: 'app-load-request',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        ReactiveFormsModule,
        MatInputModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSortModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatOptionModule,
        MatSelectModule,
        LoadRequestActivityComponent,
        AsyncPipe
    ],
    templateUrl: './load-request.component.html',
    animations: [
        trigger('detailExpand', [
            state('collapsed,void', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LoadRequestComponent implements AfterViewInit {
    displayedColumns: string[] = [
        'requestId',
        'codeSystemName',
        'sourceFilePath',
        'requestSubject',
        'requestStatus',
        'version',
        'availableDate',
        'requester',
        'requestTime'
    ];
    columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

    loadRequestDatabase: LoadRequestDataSource | null = null;
    data: WritableSignal<LoadRequest[]> = signal([]);

    expandedElement: LoadRequest | null = null;

    resultsLength = 0;

    @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort!: MatSort;

    searchCriteria = new FormGroup(
        {
            filterTerm: new FormControl(''),
            requestDateType: new FormControl(0),
            requestType: new FormControl(0),
        }, {updateOn: 'submit',}
    );

    constructor(private _httpClient: HttpClient,
                public dialog: MatDialog,
                private loadingService: LoadingService,
                public alertService: AlertService) {
    }

    ngAfterViewInit() {
        this.loadRequestDatabase = new LoadRequestDataSource(this._httpClient);

        // If the user changes the sort order, reset back to the first page.
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        this.searchCriteria.valueChanges.subscribe(() => this.paginator.pageIndex = 0);

        // @TODO request gets called twice and causes network error. See why later.
        merge(this.searchCriteria.valueChanges, this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.loadingService.showLoading();
                    const filter = this.searchCriteria.get('filterTerm')?.getRawValue() || '';
                    const sort = this.sort.active;
                    const order = this.sort.direction;
                    const pageNumber = this.paginator.pageIndex;
                    const pageSize = this.paginator.pageSize
                    return this.loadRequestDatabase!.getLoadRequests(
                        filter, sort, order, pageNumber, pageSize
                    ).pipe(catchError(() => of(null)));
                }),
                map((data: LoadRequestsApiResponse | null) => {
                    if (data === null) {
                        return [];
                    }

                    this.resultsLength = data.total_count;
                    return data.items;
                }),
            )
            .subscribe(data => {
                this.data.set(data);
                this.loadingService.hideLoading()
            });
    }

    onClear() {
        this.searchCriteria.get('filterTerm')?.reset('', {emitEvent: true});
    }

    openCreateLoadRequestModal() {
        this.dialog.open(CreateLoadRequestModalComponent, {
            width: '700px'
        })
            .afterClosed()
            .subscribe({
                next: res => {
                    if (res === 'success') {
                        this.alertService.addAlert('info', 'Successfully created load request.')
                        this.paginator.pageIndex = 0;
                    } else if (res === 'error') {
                        this.alertService.addAlert('danger', 'Error create load request.')
                    }
                }
            });
    }

    fetchLoadRequestActivity(event: MouseEvent, loadRequest: LoadRequest) {
        this.expandedElement = this.expandedElement === loadRequest ? null : loadRequest
        event.stopPropagation();
    }

    // @TODO get all pages
    download() {
        const blob = new Blob([JSON.stringify(this.data)], {type: 'application/json'});
        saveAs(blob, 'loadRequests-export.json');
        this.alertService.addAlert('', 'Export downloaded.');
    }
}
