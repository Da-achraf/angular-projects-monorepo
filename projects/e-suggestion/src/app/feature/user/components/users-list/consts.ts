import { TableColumn } from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';

export const COLUMNS: TableColumn[] = [
  {
    header: 'TE Id',
    field: 'te_id',
    sortable: true,
    sortField: 'te_id',
    filter: { type: 'text', field: 'te_id' },
    type: 'text',
  },
  {
    header: 'Full Name',
    field: '',
    type: 'custom',
    sortable: true,
    sortField: 'first_name',
    filter: { type: 'text', field: 'first_name' },
    template: 'fullNameTemplate',
  },

  {
    header: 'Role',
    field: '',
    type: 'custom',
    sortable: true,
    template: 'roleTemplate',
  },

  {
    header: 'Registered At',
    field: 'created_at',
    sortable: true,
    sortField: 'created_at',
    filter: { type: 'date', field: 'created_at' },
    type: 'date',
  },
  {
    header: 'Account Status',
    field: 'account_status',
    type: 'custom',
    template: 'statusTemplate',
  },
];

export const GLOBAL_FILTER_FIELDS = [
  'first_name',
  'last_name',
  'account_status',
];
