import { inject } from '@angular/core';
import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { MessageService } from 'primeng/api';
import { Plant, PlantCreate, PlantUpdate } from './plant.model';
import { PlantService } from './plant.service';

type PlantState = {};
const intitialState: PlantState = {};

export const PlantStore = signalStore(
  { providedIn: 'root' },
  withState<PlantState>(intitialState),
  withPagedEntities<Plant, PlantCreate, PlantUpdate>(PlantService),
  withSimpleEntities<Plant>(PlantService),

  withProps(() => ({
    messageService: inject(MessageService),
  }))
);
