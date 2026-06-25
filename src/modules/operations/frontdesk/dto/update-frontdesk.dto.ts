import { PartialType } from '@nestjs/mapped-types';
import { CreateFrontdeskDto } from './create-frontdesk.dto';

export class UpdateFrontdeskDto extends PartialType(CreateFrontdeskDto) {}
