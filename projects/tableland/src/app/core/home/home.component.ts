import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ba/core/data-access';
import { LogoComponent } from '../../ui/components/logo.component';
import { MeteorsFallingComponent } from '../../ui/components/meteors-falling/meteors-falling.component';
import { LanguageSwitcherComponent } from './language-switcher.component';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    FormsModule,
    TranslatePipe,
    LogoComponent,
    MeteorsFallingComponent,
    LanguageSwitcherComponent,
  ],
})
export class HomeComponent {}
