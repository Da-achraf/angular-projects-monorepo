import { inject } from '@angular/core';
import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { MessageService } from 'primeng/api';
import { BOM, BOMCreate, BOMUpdate } from './bom.model';
import { BOMService } from './bom.service';

type BOMState = {};
const intitialState: BOMState = {};

export const BOMStore = signalStore(
  { providedIn: 'root' },
  withState<BOMState>(intitialState),
  withPagedEntities<BOM, BOMCreate, BOMUpdate>(BOMService),
  withSimpleEntities<BOM>(BOMService),

  withProps(() => ({
    messageService: inject(MessageService),
  }))
);
