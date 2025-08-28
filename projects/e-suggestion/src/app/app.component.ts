import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '@ba/core/data-access/toaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, ToastComponent],
})
export class AppComponent {

}
