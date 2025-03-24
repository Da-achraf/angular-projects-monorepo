import { TableColumn } from "projects/e-suggestion/src/app/ui/components/table/table-types.interface";

export const COLUMNS: TableColumn[] = [
  {
    header: 'Title',
    type: 'text',
    field: 'title',
    sortable: true,
    sortField: 'title',
    filter: { type: 'text', field: 'title' },
  },
  {
    header: 'Created At',
    field: 'created_at',
    sortable: true,
    sortField: 'created_at',
    filter: { type: 'date', field: 'created_at' },
    type: 'date',
  },
  {
    header: 'Status',
    field: 'status',
    type: 'custom',
    sortField: 'status',
    filter: { type: 'text', field: 'status' },
    template: 'statusTemplate',
    // filterTemplate: 'statusFilterTemplate',
  },
  {
    header: 'Submitter',
    type: 'custom',
    field: 'submitter.first_name',
    sortable: true,
    sortField: 'submitter.first_name',
    filter: { type: 'text', field: 'submitter.first_name' },
    template: 'sumbitterTemplate',
  },
];

export const GLOBAL_FILTER_FIELDS = [
  'title',
  'description',
  'actual_situation',
  'submitter.first_name',
  'submitter.last_name',
];