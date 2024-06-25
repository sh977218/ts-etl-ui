import { Injectable } from '@angular/core';
import { Tab } from './model/tab';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  tabs: Tab[] = [
    { route: 'load-requests', label: 'Load Requests' },
    { route: 'load-versions', label: 'QA Versions' },
    { route: 'code-systems', label: 'Code Systems' },
  ];
}
