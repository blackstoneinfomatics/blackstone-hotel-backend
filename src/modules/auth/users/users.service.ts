import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './repositories/users.repository';
import { User } from '@prisma/client';
import { UserWithRelations } from './types/UserWithRelations.type';

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

  async findUserByEmailAndPassword(email:string,tenantId?: string): Promise<UserWithRelations | null>{
    return this.userRepository.findUserByEmailAndPassword(email,tenantId);
  }

   async findUserByEmailAndGoogle(email:string,tenantId?: string) : Promise<UserWithRelations | null>{
    return this.userRepository.findUserByEmailAndGoogle(email,tenantId);
  }

  async findUserByEmail(email:string,tenantId?: string): Promise<UserWithRelations | null>{
    return this.userRepository.findUserByEmail(email,tenantId);
  }

  async findUserById(id:string,tenantId?: string): Promise<UserWithRelations | null>{
    return this.userRepository.findUserById(id,tenantId);
  }

  async updatePasswordDetailsByUserId(userId:string,mustChangePassword:boolean){
    return this.userRepository.updatePasswordDetailsByUserId(userId,mustChangePassword);
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
