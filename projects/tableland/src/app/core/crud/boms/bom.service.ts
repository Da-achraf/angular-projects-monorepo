import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { BOM, BOMCreate, BOMUpdate } from './bom.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BOMService extends CrudBaseService<BOM, BOMCreate, BOMUpdate> {
  constructor() {
    super('/bom');
  }

  loadBom(pn: string, workstation: string) {
    return this.load(1, 25, { pn, workstation }).pipe(
      map(r => r.content as BOM[])
    );
  }
}
