import { Component, inject, model, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

@Component({
  selector: 'ba-date-filter',
  templateUrl: 'date-filter.component.html',
  styleUrl: 'date-filter.component.css',
  imports: [
    MatFormFieldModule,
    MatInput,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    BaButtonComponent,
  ],
})
export class DateFilterComponent implements OnInit {

  filterChanged = output<{
    start: Date | null;
    end: Date | null;
  }>();

  start = model<Date | null>();
  end = model<Date | null>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  activeFilter: string | null = null;
  dateError = false;

  ngOnInit(): void {
    this.setLast30Days();
  }

  setLast30Days() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.startDate = thirtyDaysAgo;
    this.endDate = today;
    this.activeFilter = 'last-30-days';
    this.dateError = false;
  }

  setLastMonth() {
    const today = new Date();
    const firstDayLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    this.startDate = firstDayLastMonth;
    this.endDate = lastDayLastMonth;
    this.activeFilter = 'last-month';
    this.dateError = false;
  }

  setLast60Days() {
    const today = new Date();
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    this.startDate = sixtyDaysAgo;
    this.endDate = today;
    this.activeFilter = 'last-60-days';
    this.dateError = false;
  }

  setAllTime() {
    this.startDate = null;
    this.endDate = null;
    this.activeFilter = 'all';
    this.dateError = false;
  }

  exportReport() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.dateError = true;
      return;
    }

    this.dateError = false;

    const queryParams: QueryParamType = {
      fromDate: this.startDate ? this.startDate.toISOString() : null,
      toDate: this.endDate ? this.endDate.toISOString() : null,
    };
  }
}
