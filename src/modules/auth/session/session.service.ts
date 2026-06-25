import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateActiveSessionDto,
} from './dto/create-session.dto';
import { UpdateJtiSessionDto } from './dto/updateJti-session.dto';
import { ActiveSessionRepository } from './repositories/activesessions.repository';
import { GetActiveSessionByIdResponse } from './interfaces/getSession.interface';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(private readonly sessionRepository: ActiveSessionRepository) {}

 async create(createSessionDto: CreateActiveSessionDto) {
  try {
    await this.sessionRepository.create(createSessionDto);
  } catch (error: any) {
    this.logger.error('Failed to create session', error.stack);

    throw new InternalServerErrorException('Unable to create session');
  }
}

  findAll() {
    return `This action returns all session`;
  }

  async getById(id: string , tenantId? :string): Promise<GetActiveSessionByIdResponse> {
  const session = await this.sessionRepository.findById(id,tenantId);

  if (!session) {
    throw new NotFoundException('Session not found');
  }

  return {
    id: session.id,
    tenantId: session.tenantId,
    userId: session.userId,
    deviceId: session.deviceId,
    platform :session.platform,
    accessTokenJti: session.accessTokenJti,
    refreshTokenJti: session.refreshTokenJti,
    refreshExpiresAt: session.refreshExpiresAt,
    loginAt: session.loginAt,
    lastAccessedAt: session.lastAccessedAt,
    logoutAt: session.logoutAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    isRevoked: session.isRevoked,
    revokedAt: session.revokedAt,
    country: session.country,
    deletedAt:session.deletedAt,
    appVersion: session.appVersion,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

  async updateJti(
  id: string,
  updateSessionDto: UpdateJtiSessionDto,
): Promise<void> {
  try {
    await this.sessionRepository.updateRefreshJti(id, updateSessionDto);
  } catch (error: any) {
    this.logger.error(
      `Failed to update active session ${id}`,
      error.stack,
    );

    throw new InternalServerErrorException(
      'Unable to update active session',
    );
  }
}

async revokeSession(sessionId:string){
  try{
    const session = await this.sessionRepository.findSessionId(sessionId);
    if (!session) {
      throw new NotFoundException('Active session not found.');
    }
    await this.sessionRepository.revokeUpdate(sessionId);
    this.logger.log(`Session revoked: ${sessionId}`);

  }catch(error:any){
    this.logger.error(
      `Failed to revoke session ${sessionId}`,
      error instanceof Error ? error.stack : undefined,
    );
    throw error;
  }
}

  remove(id: number) {
    return `This action removes a #${id} session`;
  }
}
