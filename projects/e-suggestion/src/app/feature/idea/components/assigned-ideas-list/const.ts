import { TableColumn } from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';

export const COLUMNS: TableColumn[] = [
  {
    header: 'idea-title',
    type: 'custom',
    field: 'title',
    filter: { type: 'text', field: 'title' },
    template: 'titleTemplate'
  },
  {
    header: 'created-at',
    field: 'created_at',
    sortable: true,
    sortField: 'created_at',
    filter: { type: 'date', field: 'created_at' },
    type: 'date',
  },
  {
    header: 'status',
    field: 'status',
    type: 'custom',
    sortField: 'status',
    filter: { type: 'text', field: 'status' },
    template: 'statusTemplate',
  },
  {
    header: 'Submitter',
    type: 'custom',
    field: 'submitter.first_name',
    filter: { type: 'text', field: 'submitter.first_name' },
    template: 'sumbitterTemplate',
  },
  {
    header: 'category',
    type: 'custom',
    field: 'category',
    filter: { type: 'text', field: 'category' },
    template: 'categoryTemplate',
  },
  {
    header: 'department',
    type: 'custom',
    field: 'department.name',
    filter: { type: 'text', field: 'department.name' },
    template: 'departmentTemplate',
  },
];

export const GLOBAL_FILTER_FIELDS = [
  'title',
  'description',
  'actual_situation',
  'submitter.first_name',
  'submitter.last_name',
];
