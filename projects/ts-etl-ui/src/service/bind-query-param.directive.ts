import { Directive, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

const DEFAULT_VALUE_MAP: Record<string, string | null | number> = {
  emptyString: '',
  null: null,
  zero: 0,
};

@Directive({
  selector: '[bindQueryParam]',
  standalone: true,
})
export class BindQueryParamDirective implements OnInit {
  @Input('bindQueryParam') paramKey!: string;
  @Input() defaultToEmptyString: string = 'null';

  constructor(private ngControl: NgControl) {
  }

  ngOnInit() {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.has(this.paramKey)) {
      const value = queryParams.get(this.paramKey);
      this.ngControl.control?.patchValue(value ? value : DEFAULT_VALUE_MAP[this.defaultToEmptyString]);
    } else {
      this.ngControl.control?.patchValue(DEFAULT_VALUE_MAP[this.defaultToEmptyString]);
    }
  }
}