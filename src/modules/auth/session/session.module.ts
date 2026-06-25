import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ActiveSessionRepository } from './repositories/activesessions.repository';

@Module({
  controllers: [SessionController],
  providers: [SessionService,ActiveSessionRepository],
  exports:[SessionService]
})
export class SessionModule {}
