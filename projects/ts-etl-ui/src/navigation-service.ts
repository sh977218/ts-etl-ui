import { Injectable } from '@angular/core';
import { Tab } from './model/tab';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  tabs: Tab[] = [
    { route: 'load-request', label: 'Load Request' },
    { route: 'load-version', label: 'Load Version' },
    { route: 'code-system', label: 'Code System' },
  ];
}
