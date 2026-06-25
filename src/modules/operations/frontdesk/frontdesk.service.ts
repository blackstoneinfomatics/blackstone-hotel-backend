import { Injectable } from '@nestjs/common';
import { CreateFrontdeskDto } from './dto/create-frontdesk.dto';
import { UpdateFrontdeskDto } from './dto/update-frontdesk.dto';

@Injectable()
export class FrontdeskService {
  create(createFrontdeskDto: CreateFrontdeskDto) {
    return 'This action adds a new frontdesk';
  }

  findAll() {
    return `This action returns all frontdesk`;
  }

  findOne(id: number) {
    return `This action returns a #${id} frontdesk`;
  }

  update(id: number, updateFrontdeskDto: UpdateFrontdeskDto) {
    return `This action updates a #${id} frontdesk`;
  }

  remove(id: number) {
    return `This action removes a #${id} frontdesk`;
  }
}
