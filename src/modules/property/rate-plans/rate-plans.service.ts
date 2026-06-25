import { Injectable } from '@nestjs/common';
import { CreateRatePlanDto } from './dto/create-rate-plan.dto';
import { UpdateRatePlanDto } from './dto/update-rate-plan.dto';

@Injectable()
export class RatePlansService {
  create(createRatePlanDto: CreateRatePlanDto) {
    return 'This action adds a new ratePlan';
  }

  findAll() {
    return `This action returns all ratePlans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ratePlan`;
  }

  update(id: number, updateRatePlanDto: UpdateRatePlanDto) {
    return `This action updates a #${id} ratePlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} ratePlan`;
  }
}
