import { Injectable } from '@nestjs/common';
import { CreateFolioDto } from './dto/create-folio.dto';
import { UpdateFolioDto } from './dto/update-folio.dto';

@Injectable()
export class FoliosService {
  create(createFolioDto: CreateFolioDto) {
    return 'This action adds a new folio';
  }

  findAll() {
    return `This action returns all folios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} folio`;
  }

  update(id: number, updateFolioDto: UpdateFolioDto) {
    return `This action updates a #${id} folio`;
  }

  remove(id: number) {
    return `This action removes a #${id} folio`;
  }
}
