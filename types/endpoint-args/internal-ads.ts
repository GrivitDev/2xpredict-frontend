/* Request contracts for internal-ads endpoints. */
import type { CreateInternalAdDto, UpdateInternalAdDto } from '../requests';

export interface FindOneArgs {
  path: { id: string };
}

export interface CreateArgs {
  body: CreateInternalAdDto;
}

export interface UpdateArgs {
  path: { id: string };
  body: UpdateInternalAdDto;
}

export interface RemoveArgs {
  path: { id: string };
}
