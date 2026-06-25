import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {

  constructor(
    private readonly userRepository : UsersRepository
  ){}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findUserByEmailAndPassword(email:string,tenantId?: string){
    return this.userRepository.findUserByEmailAndPassword(email,tenantId);
  }

   async findUserByEmailAndGoogle(email:string,tenantId?: string){
    return this.userRepository.findUserByEmailAndGoogle(email,tenantId);
  }

  async findUserByEmail(email:string,tenantId?: string){
    return this.userRepository.findUserByEmail(email,tenantId);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
