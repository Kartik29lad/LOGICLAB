/**
 * Challenge Application Use Cases Contract
 */

import type { SubmitChallengeRequestDto, SubmitChallengeResponseDto } from "../api/challenge-dto";
import type { IUseCase } from "./use-case.contract";

export type ISubmitChallengeUseCase = IUseCase<
  SubmitChallengeRequestDto,
  SubmitChallengeResponseDto
>;
