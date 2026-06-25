import { Module } from '@nestjs/common';
import { FoliosService } from './folios.service';
import { FoliosController } from './folios.controller';

@Module({
  controllers: [FoliosController],
  providers: [FoliosService],
})
export class FoliosModule {}
