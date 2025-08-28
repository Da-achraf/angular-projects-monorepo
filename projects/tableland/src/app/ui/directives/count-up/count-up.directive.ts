import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  animationFrameScheduler,
  combineLatest,
  distinctUntilChanged,
  endWith,
  interval,
  map,
  switchMap,
  takeUntil,
  takeWhile
} from 'rxjs';
import { Destroy } from './destroy';

/**
 * Quadratic Ease-Out Function: f(x) = x * (2 - x)
 */
const easeOutQuad = (x: number): number => x * (2 - x);

@Directive({
  selector: '[countUp]',
  providers: [Destroy],
})
export class CountUpDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroy$ = inject(Destroy);

  countUp = input<number>(0);
  duration = input(200);

  private readonly count$ = toObservable(this.countUp);
  private readonly duration$ = toObservable(this.duration);

  private readonly currentCount$ = combineLatest([
    this.count$,
    this.duration$,
  ]).pipe(
    switchMap(([count, duration]) => {
      // get the time when animation is triggered
      const startTime = animationFrameScheduler.now();

      return interval(0, animationFrameScheduler).pipe(
        // calculate elapsed time
        map(() => animationFrameScheduler.now() - startTime),
        // calculate progress
        map((elapsedTime) => elapsedTime / duration),
        // complete when progress is greater than 1
        takeWhile((progress) => progress <= 1),
        // apply quadratic ease-out
        // for faster start and slower end of counting
        map(easeOutQuad),
        // calculate current count
        map((progress) => Math.round(progress * count)),
        // make sure that last emitted value is count
        endWith(count),
        distinctUntilChanged()
      );
    })
  );

  ngOnInit(): void {
    this.displayCurrentCount();
  }

  private displayCurrentCount(): void {
    this.currentCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentCount) => {
        this.renderer.setProperty(
          this.elementRef.nativeElement,
          'innerHTML',
          currentCount
        );
      });
  }
}
