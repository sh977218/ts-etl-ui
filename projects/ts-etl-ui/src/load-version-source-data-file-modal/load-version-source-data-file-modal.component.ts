import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { environment } from '../environments/environment';

@Component({
  standalone: true,
  imports: [
    AsyncPipe,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './load-version-source-data-file-modal.component.html',
})
export class LoadVersionSourceDataFileModalComponent {
  fileContent;

  constructor(@Inject(MAT_DIALOG_DATA) public fileId: string,
              private http: HttpClient) {
    this.fileContent = http.get(`${environment.apiServer}/file/${fileId}`, { responseType: 'text' });
  }
}
