import { Pipe, PipeTransform } from '@angular/core';
import { SystemSettingsService } from '../services/system-settings.service';

@Pipe({
  name: 'systemCurrency',
  standalone: true,
})
export class SystemCurrencyPipe implements PipeTransform {
  constructor(private systemSettingsService: SystemSettingsService) {}

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return '—';
    }

    return this.systemSettingsService.formatCurrency(numValue);
  }
}

