import { Injectable } from '@angular/core';
import { Tab } from './model/tab';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  tabs: Tab[] = [
    { route: 'load-request', label: 'Load Request', isActive: false },
    { route: 'load-version', label: 'Load Version', isActive: false },
    { route: 'code-system', label: 'Code System', isActive: false },
  ];
}
