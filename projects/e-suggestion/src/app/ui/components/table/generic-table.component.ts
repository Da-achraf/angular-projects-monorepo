import { DatePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  contentChildren,
  inject,
  input,
  OnInit,
  output,
  TemplateRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PAGE_SIZE } from '@ba/core/data-access';
import { Button } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Table, TableModule } from 'primeng/table';
import { BaButtonComponent } from '../button/button.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { SearchBarComponent } from '../search/search-bar.component';
import { TableColumn } from './table-types.interface';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'ba-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  imports: [
    TableModule,
    Button,
    SearchBarComponent,
    PaginatorComponent,
    NgTemplateOutlet,
    DatePipe,
    TitleCasePipe,
    BaButtonComponent,
    LoadingComponent,
    MenuModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class GenericTableComponent implements OnInit {
  templates = contentChildren<TemplateRef<any>>(TemplateRef);

  readonly data = input<any[]>([]);
  readonly total = input.required<number>();
  readonly columns = input<TableColumn[]>([]);
  readonly globalFilterFields = input<string[]>([]);
  readonly pageSizeOptions = input([25, 50, 100, 200]);
  readonly loading = input(true);

  readonly withCreate = input(false);
  readonly withEdit = input(false);
  readonly withDelete = input(false);
  readonly withViewDetail = input(false);
  readonly withReview = input(false);
  readonly withExport = input(false);

  page = output<number>();
  pageSize = output<number>();

  create = output<void>();
  edit = output<number>();
  view = output<number>();
  delete = output<number>();
  review = output<number>();

  columnsLength = computed(() => this.columns().length);

  private readonly size = inject(PAGE_SIZE);

  ngOnInit(): void {
    this.page.emit(1);
    this.pageSize.emit(this.size);
  }

  getTableDataTemplate(column: any): TemplateRef<any> | null {
    const template = this.templates().find(
      (t: any) => t['_declarationTContainer'].localNames[0] === column.template
    );
    return template || null;
  }

  getFilterTemplate(column: any): TemplateRef<any> | null {
    const template = this.templates().find(
      (t: any) => t['_declarationTContainer'].localNames[0] === column.filterTemplate
    );
    return template || null;
  }

  clear(table: Table) {
    table.clear();
  }

  onFilter(event: any) {
    // console.log('Filter: ', event);
  }
}
