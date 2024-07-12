import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  input,
  ViewChild,
} from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { map, of, switchMap, tap } from 'rxjs';
import { saveAs } from 'file-saver';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { triggerExpandTableAnimation } from '../animations';
import { LoadVersion, LoadVersionActivity } from '../model/load-version';
import { AlertService } from '../service/alert-service';
import { DownloadService } from '../service/download-service';
import { LoadVersionNoteComponent } from '../load-version-note/load-version-note.component';

@Component({
  selector: 'app-load-version-activity',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    LoadVersionNoteComponent,
    NgIf,
    MatIcon,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './load-version-activity.component.html',
  styleUrl: './load-version-activity.component.scss',
  animations: [triggerExpandTableAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class LoadVersionActivityComponent implements AfterViewInit {
  loadVersion = input.required<LoadVersion>();

  requestId = computed(() => this.loadVersion().requestId);
  loadVersionActivities = computed(() => this.loadVersion().loadVersionActivities);
  editDateMode = -1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) activitiesTable!: MatTable<LoadVersionActivity>;

  displayedColumns: string[] = ['id', 'activity', 'availableDate', 'reason', 'nbNotes'];

  dataSource = computed(() => {
    return new MatTableDataSource<LoadVersionActivity>(this.loadVersionActivities().reverse());
  });

  editAvailableDateForm = new FormGroup(
    {
      availableDate: new FormControl<Date>(new Date(), [Validators.required]),
    }, { updateOn: 'submit' },
  );

  tomorrow: Date;

  constructor(private alertService: AlertService,
              private downloadService: DownloadService,
              private cd: ChangeDetectorRef,
              private http: HttpClient) {
    const today = new Date();
    this.tomorrow = new Date(today);
    this.tomorrow.setDate(today.getDate() + 1);
  }

  ngAfterViewInit(): void {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
    this.editAvailableDateForm.valueChanges.pipe(
      switchMap(value => {
        return this.http.post<string>(`${environment.apiServer}/editAvailableDate`, {
          requestId: this.requestId(),
          newDate: value.availableDate,
        });
      }),
      tap({
        next: () => {
          this.alertService.addAlert('info', `Available Date Updated`);
          if (this.editAvailableDateForm.get('availableDate')?.value) {
            this.loadVersionActivities()[0]!.availableDate = this.editAvailableDateForm.get('availableDate')!.value!;
          }
          this.activitiesTable.renderRows();
          this.cd.detectChanges();
        },
        error: () => this.alertService.addAlert('danger', 'Unexpected Error'),
      }),
    ).subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();

    if (this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

  downloadQaActivities() {
    of(this.loadVersionActivities())
      .pipe(
        map(data => {
          const headerList = [...this.displayedColumns];
          data.forEach(item => item.nbNotes = item.notes.length);
          return this.downloadService.generateBlob(headerList, data);
        }),
        tap({
          next: (blob) => {
            saveAs(blob, 'loadVersionActivity-export.csv');
            this.alertService.addAlert('', 'QA Activities downloaded.');
          },
          error: () => this.alertService.addAlert('', 'QA Activities download failed.'),
        }),
      )
      .subscribe();
  }

}
