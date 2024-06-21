import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [
    AsyncPipe,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './version-qa-source-data-file-modal.component.html',
})
export class VersionQaSourceDataFileModalComponent {
  fileContent;

  constructor(@Inject(MAT_DIALOG_DATA) public fileId: string,
              private http: HttpClient) {
    this.fileContent = http.get(`/file/${fileId}`, { responseType: 'text' });
  }
}
