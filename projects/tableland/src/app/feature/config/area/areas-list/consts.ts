import { TableColumn } from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';

export const COLUMNS: TableColumn[] = [
  {
    header: 'Area Id',
    field: 'id',
    type: 'numeric',
  },
  {
    header: 'Area Name',
    field: 'name',
    filter: { type: 'text', field: 'name' },
    type: 'text',
  },
];

export const GLOBAL_FILTER_FIELDS = ['name'];
