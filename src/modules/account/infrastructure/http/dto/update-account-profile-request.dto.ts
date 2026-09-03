import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function AtLeastOneOf(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneOf',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const target = args.object as Record<string, unknown>;
          return properties.some(
            (property) =>
              target[property] !== undefined && target[property] !== null,
          );
        },
        defaultMessage() {
          return `At least one of [${properties.join(', ')}] must be provided`;
        },
      },
    });
  };
}

export class UpdateAccountProfileRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @AtLeastOneOf(['displayName', 'avatarUrl'])
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
