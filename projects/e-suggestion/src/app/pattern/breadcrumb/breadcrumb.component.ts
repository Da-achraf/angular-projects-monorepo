import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Breadcrumb } from './breadcrumb.model';
import { BreadcrumbService } from './breadcrumb.service';

@Component({
  selector: 'ba-breadcrumb',
  templateUrl: 'breadcrumb.component.html',
  styleUrl: 'breadcrumb.component.scss',
  imports: [AsyncPipe, RouterLink],
})
export class BreadcrumbComponent {
  protected readonly breadcrumbs$: Observable<Breadcrumb[]> =
    inject(BreadcrumbService).breadcrumbs$;
}
