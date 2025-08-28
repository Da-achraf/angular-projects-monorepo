import { inject } from '@angular/core';
import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { MessageService } from 'primeng/api';
import { Area, AreaCreate, AreaUpdate } from './area.model';
import { AreaService } from './area.service';

type AreaState = {};
const intitialState: AreaState = {};

export const AreaStore = signalStore(
  { providedIn: 'root' },
  withState<AreaState>(intitialState),
  withPagedEntities<Area, AreaCreate, AreaUpdate>(AreaService),
  withSimpleEntities<Area>(AreaService),

  withProps(() => ({
    messageService: inject(MessageService),
  }))
);
