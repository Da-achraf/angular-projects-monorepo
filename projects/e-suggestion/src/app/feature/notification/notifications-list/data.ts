import { TableColumn } from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';
import { FilterOption } from '../../../pattern/radio-filter/types';

export const COLUMNS: TableColumn[] = [
  {
    header: 'Notifications',
    type: 'custom',
    field: '',
    template: 'notificationTemplate',
  },
];

export const Options: FilterOption[] = [
  {
    label: 'notifications-filter-all',
    value: 'all',
    title: 'notifications-filter-all-title',
  },
  {
    label: 'notifications-filter-unread',
    value: 'unread',
    title: 'notifications-filter-unread-title',
  },
  {
    label: 'notifications-filter-read',
    value: 'read',
    title: 'notifications-filter-read-title',
  },
];
