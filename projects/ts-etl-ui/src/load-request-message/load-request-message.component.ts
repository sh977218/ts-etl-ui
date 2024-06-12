import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource, MatTableModule } from "@angular/material/table"
import { MatFormField, MatLabel } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSort, MatSortModule } from "@angular/material/sort"
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { LoadingService } from "../loading-service"
import { AlertService } from "../alert-service"
import { catchError, throwError } from "rxjs"
import { LoadRequestMessage } from "../model/load-request-message"

@Component({
  selector: "app-load-request-message",
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormField,
    MatInputModule,
    MatLabel,
  ],
  templateUrl: "./load-request-message.component.html",
  styleUrl: "./load-request-message.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadRequestMessageComponent implements OnInit {

  @Input() requestId: string | null = null

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = [
    "componentName",
    "messageGroup",
    "messageType",
    "tag",
    "message",
    "creationTime",
  ]

  dataSource: MatTableDataSource<LoadRequestMessage> = new MatTableDataSource<LoadRequestMessage>([])

  constructor(public http: HttpClient,
              private loadingService: LoadingService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.loadingService.showLoading()
    this.http.get<LoadRequestMessage[]>(`/api/loadRequestMessages/${this.requestId}`)
      .pipe(catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return []
        } else {
          return throwError(() => err)
        }
      }))
      .subscribe({
        next: data => {
          this.dataSource = new MatTableDataSource(data)
          this.dataSource.paginator = this.paginator
          this.dataSource.sort = this.sort
        },
        error: () => this.alertService.addAlert("success", "Error loading."),
      })
      .add(() => this.loadingService.hideLoading())
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }


}
