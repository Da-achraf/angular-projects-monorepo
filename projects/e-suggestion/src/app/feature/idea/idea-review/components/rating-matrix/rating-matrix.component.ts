import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  untracked,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import {
  RatingMatrix,
  RatingMatrixCreate,
  RatingMatrixUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/rating-matrix.model';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { ProcessCriteria, ResultCriteria } from './rating-matrix.model';
import { RatingScoreComponent } from 'projects/e-suggestion/src/app/ui/components/rating-mark.component';

@Component({
  selector: 'ba-rating-matrix',
  templateUrl: './rating-matrix.component.html',
  styleUrls: ['./rating-matrix.component.scss'],
  imports: [
    ReactiveFormsModule,
    BaButtonComponent,
    SelectModule,
    RatingScoreComponent,
  ],
})
export class RatingMatrixComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  ideaId = input.required<number>();
  data = input<RatingMatrix>();
  isRated = input.required<boolean>();
  loading = input(false);

  createRating = output<RatingMatrixCreate>();
  updateRating = output<RatingMatrixUpdate>();

  isUpdateMode = computed(() => !!this.data());

  ratingForm!: FormGroup;
  totalScore: number = 0;
  maxTotalScore: number = 0;

  isUpdateModeEffect = effect(() => {
    const isUpdateMode = this.isUpdateMode();
    const data = this.data();

    if (isUpdateMode && data) {
      untracked(() => {
        // this.resetForm();
        this.ratingForm.patchValue(data);
        this.calculateTotalScore();
      });
    }
  });

  protected resultCriteria = ResultCriteria;
  protected processCriteria = ProcessCriteria;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    this.ratingForm = this.fb.group({
      comments: [''],
    });

    // Add form controls for each criterion
    this.resultCriteria.concat(this.processCriteria).forEach((criterion) => {
      this.ratingForm.addControl(
        criterion.key,
        this.fb.control(0, Validators.required)
      );
    });

    // Calculate maximum possible score
    this.maxTotalScore = this.calculateMaxTotalScore();

    // Calculate total score on form changes
    this.ratingForm.valueChanges.subscribe(() => {
      this.calculateTotalScore();
    });
  }

  calculateMaxTotalScore(): number {
    let maxScore = 0;
    ResultCriteria.concat(ProcessCriteria).forEach((criterion) => {
      maxScore += Math.max(...criterion.options.map((opt) => opt.value));
    });
    return maxScore;
  }

  calculateTotalScore(): void {
    const values = this.ratingForm.value;
    this.totalScore = Object.keys(values).reduce((sum, key) => {
      const value = Number(values[key]);
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.ratingForm.valid) {
      const ratingData: RatingMatrix = {
        ...this.ratingForm.value,
        total_score: this.totalScore,
      };

      if (this.isUpdateMode()) {
        this.updateRating.emit({
          ...this.data(),
          ...ratingData,
        });
      } else {
        this.createRating.emit({
          ...ratingData,
          idea_id: this.ideaId(),
        });
      }
    }
  }

  resetForm() {
    this.ratingForm.reset();
  }
}
