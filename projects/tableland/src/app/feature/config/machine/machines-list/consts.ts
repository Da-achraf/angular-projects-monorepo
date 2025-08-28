import { TableColumn } from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';

export const COLUMNS: TableColumn[] = [
  {
    header: 'Machine Id',
    field: 'id',
    type: 'numeric',
  },
  {
    header: 'Machine Name',
    field: 'name',
    filter: { type: 'text', field: 'name' },
    type: 'text',
  },
  {
    header: 'Area',
    type: 'custom',
    field: 'area.name',
    filter: { type: 'text', field: 'area.name' },
    template: 'areaTemplate',
  },
];

export const GLOBAL_FILTER_FIELDS = ['name'];
