/**
 * Progress Application Use Cases Contract
 */

import type { ProgressSummaryDto, UpdateProgressRequestDto } from "../api/progress-dto";
import type { ProgressEntity } from "../repositories/progress-repository.contract";
import type { IUseCase } from "./use-case.contract";

export type IUpdateProgressUseCase = IUseCase<
  { userId: string; data: UpdateProgressRequestDto },
  ProgressEntity
>;

export type IGetUserProgressUseCase = IUseCase<{ userId: string }, ProgressSummaryDto>;
