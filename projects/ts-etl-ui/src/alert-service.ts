import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn:'root'
})
export class AlertService{
  constructor(private _snackBar: MatSnackBar) {}

  addAlert(type:string,message:string ) {
    this._snackBar.open(message,'Close');
  }
}
