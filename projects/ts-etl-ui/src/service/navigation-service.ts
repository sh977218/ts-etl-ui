import { Injectable } from '@angular/core';

import { Tab } from '../model/tab';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  tabs: Tab[] = [
    { route: 'load-requests', label: 'Load Request' },
    { route: 'load-versions', label: 'Version QA' },
    { route: 'code-systems', label: 'Code System' },
  ];
}
