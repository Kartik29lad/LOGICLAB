/**
 * Algorithm Application Use Cases Contract
 */

import type { ExecuteAlgorithmRequestDto, ExecuteAlgorithmResponseDto } from "../api/execution-dto";
import type { IUseCase } from "./use-case.contract";

export type IExecuteAlgorithmUseCase = IUseCase<
  ExecuteAlgorithmRequestDto,
  ExecuteAlgorithmResponseDto
>;
