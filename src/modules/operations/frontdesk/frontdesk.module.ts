import { Module } from '@nestjs/common';
import { FrontdeskService } from './frontdesk.service';
import { FrontdeskController } from './frontdesk.controller';

@Module({
  controllers: [FrontdeskController],
  providers: [FrontdeskService],
})
export class FrontdeskModule {}
