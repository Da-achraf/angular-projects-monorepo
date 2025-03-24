import { Component, inject } from '@angular/core';
import { SeverityMap } from './toast.data';
import { ToastModule } from 'primeng/toast';
import { ToasterService } from './toaster.service';
import { ToastClassPipe } from './toast-class.pipe';
import { NgClass } from '@angular/common';

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
