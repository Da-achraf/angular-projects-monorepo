import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ToastClassPipe } from './toast-class.pipe';
import { SeverityMap } from './toast.data';
import { ToasterService } from './toaster.service';

@Component({
  selector: 'ba-toast',
  templateUrl: './toast.component.html',
  imports: [ToastModule, ToastClassPipe, NgClass]
})
export class ToastComponent {
  // Severity configuration
  severityMap = SeverityMap;

  protected readonly toastrService = inject(ToasterService);
}
