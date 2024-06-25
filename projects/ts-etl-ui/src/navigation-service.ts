import { Injectable } from '@angular/core';
import { Tab } from './model/tab';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  tabs: Tab[] = [
    { route: 'load-request', label: 'Load Requests' },
    { route: 'load-version', label: 'QA Versions' },
    { route: 'code-system', label: 'Code Systems' },
  ];
}
