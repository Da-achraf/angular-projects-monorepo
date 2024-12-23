import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [RouterLink]
})
export class HomeComponent {
  title = 'e-suggestion';
}
