import { Component, ComponentRef, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { RatingScoreComponent } from 'projects/e-suggestion/src/app/ui/components/rating-mark.component';
import { RatingMatrixComponent } from './rating-matrix.component';
import { ProcessCriteria, ResultCriteria } from './rating-matrix.model';

// Stub components for dependencies
@Component({ selector: 'ba-button', template: '' })
class StubBaButtonComponent {
  label = input<string>();
  isLoading = input(false);
  disabled = input(false);
  onClick = output<void>();
}

@Component({ selector: 'ba-rating-score', template: '' })
class StubRatingScoreComponent {
  score = input(0);
}

describe('RatingMatrixComponent', () => {
  let component: RatingMatrixComponent;
  let fixture: ComponentFixture<RatingMatrixComponent>;
  let componentRef: ComponentRef<RatingMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RatingMatrixComponent],
    })
      .overrideComponent(RatingMatrixComponent, {
        remove: { imports: [BaButtonComponent, RatingScoreComponent] },
        add: { imports: [StubBaButtonComponent, StubRatingScoreComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RatingMatrixComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('ideaId', 1);
    componentRef.setInput('isRated', false);
    componentRef.setInput('loading', false);

    fixture.detectChanges();
  });

  // Tests will go here
  it('should create and initialize form with all criteria controls', () => {
    expect(component).toBeTruthy();
    const allCriteria = [...ResultCriteria, ...ProcessCriteria];
    allCriteria.forEach(criterion => {
      expect(component.ratingForm.contains(criterion.key)).toBeTrue();
    });
  });

  it('form should be valid initially', () => {
    expect(component.ratingForm.valid).toBeTrue();
  });

  it('should calculate totalScore correctly when form values change', () => {
    const criteriaKeys = [...ResultCriteria, ...ProcessCriteria].map(
      c => c.key
    );
    const key1 = criteriaKeys[0];
    const key2 = criteriaKeys[1];

    component.ratingForm.get(key1)?.setValue(2);
    component.ratingForm.get(key2)?.setValue(3);
    fixture.detectChanges();

    const expectedTotal = 2 + 3;
    expect(component.totalScore).toBe(expectedTotal);
  });

  it('should calculate maxTotalScore correctly', () => {
    let expectedMax = 0;
    ResultCriteria.forEach(c => {
      expectedMax += Math.max(...c.options.map(({ value }) => value));
    });
    ProcessCriteria.forEach(c => {
      expectedMax += Math.max(...c.options.map(({ value }) => value));
    });
    expect(component.maxTotalScore).toBe(expectedMax);
  });

  it('should emit createRating event when form is submitted in create mode', () => {
    spyOn(component.createRating, 'emit');

    const testComment = 'Test comment';
    const criteriaKeys = [...ResultCriteria, ...ProcessCriteria].map(
      c => c.key
    );
    const testValues: any = { comments: testComment };
    criteriaKeys.forEach(key => (testValues[key] = 2));

    component.ratingForm.patchValue(testValues);
    component.onSubmit();

    const expectedTotal = 2 * criteriaKeys.length;
    const expectedData = {
      ...testValues,
      idea_id: component.ideaId(),
      total_score: expectedTotal,
    };
    expect(component.createRating.emit).toHaveBeenCalledWith(expectedData);
  });
});
