interface ColumnFilter {
  type: 'date' | 'text' | 'numeric' | 'boolean';
  field: string;
}

export interface TableColumn {
  header: string;
  field: string;
  sortable?: boolean;
  sortField?: string;
  filter?: ColumnFilter;
  type?: 'date' | 'text' | 'custom' | 'boolean';
  
  /**
   * 
   * @description
   * Provided for tds (table data) that require custom ui,
   * or for ones that are displayed using a combination of fields.
   */
  template?: string;

  /**
   * 
   * @description
   * Provided for columns that require custom filter
   */
  filterTemplate?: string | undefined;
}
