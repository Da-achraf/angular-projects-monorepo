import { TableColumn } from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';

export const COLUMNS: TableColumn[] = [
  {
    header: 'Business Unit Id',
    field: 'id',
    sortable: true,
    sortField: 'id',
    type: 'numeric',
  },
  {
    header: 'Business Unit Name',
    field: 'name',
    sortable: true,
    sortField: 'name',
    filter: { type: 'text', field: 'name' },
    type: 'text',
  },
];

export const GLOBAL_FILTER_FIELDS = ['name'];
