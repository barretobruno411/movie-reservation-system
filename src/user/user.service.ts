import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}
  async create(createUserDto: CreateUserDto) {
    try {
      
      const user = this.userRepository.create(createUserDto);
      return this.userRepository.save(user);

    } catch (err) {

      if(err instanceof QueryFailedError && err.driverError?.code === '23505') {
        throw new HttpException(
          'username ja em uso',
          HttpStatus.CONFLICT,
        )
      }

      throw new HttpException('Erro interno ao criar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  findAll() {
    return `This action returns all user`;
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
