import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import _ from 'lodash';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { User } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.model';
import { UsersStore } from 'projects/e-suggestion/src/app/core/auth/data-access/services/users.store';
import { TranslatePipe } from '@ba/core/data-access';

@Component({
  selector: 'ba-assignees',
  templateUrl: 'assignees.component.html',
  imports: [MultiSelectModule, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssigneesComponent {
  /**
   * This controls wether the assignees dropdown is modifiable or not
   */
  disabled = input(false);

  assignees = input<User[]>();

  assigneesMultiSelect = viewChild<MultiSelect>('assigneesMultiSelect');

  protected readonly possibleAssignees = inject(UsersStore).assignees;
  protected selectedAssignees: User[] = [];
  private selectedAssigneesCache: User[] = [];

  assigneesChange = output<number[]>();
  panelHide = output<void>();

  private readonly assigneesEffect = effect(() => {
    const assignees = this.assignees();
    if (assignees) {
      untracked(() => {
        this.selectedAssignees = assignees;
        this.selectedAssigneesCache = [...assignees];
      });
    }
  });

  onAssigneesChange() {
    const assignneesIds = this.selectedAssignees.map(a => a.id);
    this.assigneesChange.emit(assignneesIds);
  }

  onAssigneesPanelHide() {
    if (this.assigneesValueChanged()) {
      this.panelHide.emit();
    }
  }

  private assigneesValueChanged() {
    return (
      this.selectedAssignees.length != 0 &&
      !_.isEqual(this.selectedAssignees, this.selectedAssigneesCache)
    );
  }
}
