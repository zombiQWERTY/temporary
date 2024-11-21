import {
  IsBoolean,
  IsEnum,
  IsPositive,
  IsJSON,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EventTypeEnum {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  ShadowDelete = 'ShadowDelete',
  Apply = 'Apply',
  Decline = 'Decline',
  Income = 'Income',
  Outgo = 'Outgo',
  Transfer = 'Transfer',
  Log = 'Log',
}

export enum OutcomeEnum {
  Success = 'Success',
  Failure = 'Failure',
  Process = 'Process',
  Log = 'Log',
}

export class Event {
  @IsEnum(EventTypeEnum)
  eventType: EventTypeEnum;

  @IsOptional()
  @IsString()
  eventDescription?: string;
}

export class State {
  @IsJSON()
  @IsOptional()
  oldState?: Record<string, any>;

  @IsJSON()
  @IsOptional()
  newState?: Record<string, any>;
}

export class User {
  @IsPositive()
  id: number;

  @IsString()
  @IsOptional()
  role?: string;

  @IsOptional()
  @IsPositive()
  branchId?: number;
}

export class ProxyAuth {
  @IsBoolean()
  enabled: boolean;

  @ValidateNested()
  @Type(() => User)
  user: User;
}

export class PutLogRequestDto {
  @IsOptional()
  @IsString()
  resource: string;

  @ValidateNested()
  @Type(() => Event)
  event: Event;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsEnum(OutcomeEnum)
  outcome: OutcomeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => State)
  state?: State;

  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProxyAuth)
  proxyAuth?: ProxyAuth;

  @IsOptional()
  @IsJSON()
  additionalParams?: any;
}
