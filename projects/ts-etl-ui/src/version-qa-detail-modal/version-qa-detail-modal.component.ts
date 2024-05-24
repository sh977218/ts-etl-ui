import { Component } from '@angular/core';
import { MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";

@Component({
  selector: 'app-version-qa-detail-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './version-qa-detail-modal.component.html'
})
export class VersionQaDetailModalComponent {

}
