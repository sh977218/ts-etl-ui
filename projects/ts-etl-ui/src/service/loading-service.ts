import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({providedIn: 'root'})
export class LoadingService {
  private readonly _loading$ = new BehaviorSubject(false)

  get loading$ (){
    return this._loading$;
  }

  showLoading(){
    this.loading$.next(true);
  }

  hideLoading(){
    this.loading$.next(false);
  }
}
