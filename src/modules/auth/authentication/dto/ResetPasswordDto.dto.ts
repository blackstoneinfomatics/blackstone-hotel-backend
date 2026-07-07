import { Match } from '@/shared/decorators/validators/match.decorator';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class ResetUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character.',
  })
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword', {
    message: 'Confirm password does not match new password.',
  })
  confirmPassword!: string;

  @IsBoolean()
  @IsOptional()
  forcePasswordChange?: boolean = true;
}
