import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Match } from 'src/shared/decorators/validators/match.decorator';

export class ChangePasswordDto {

  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character.',
    },
  )
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword', {
    message: 'Confirm password does not match new password.',
  })
  confirmPassword!: string;
}