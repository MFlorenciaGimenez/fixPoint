import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entity/professional.entity';
import { UpdateProfessionalDto } from './dto/updateProfessional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  async getProfessional(
    page: number,
    limit: number,
    speciality?: string,
  ): Promise<{
    data: Professional[];
    total: number;
    page: number;
    limit: number;
  }> {
    const qb = this.professionalRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user');

    if (speciality) {
      qb.where('p.speciality ILIKE :spec', { spec: `%${speciality}%` });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async getProfessionalById(id: string): Promise<Professional> {
    const pro = await this.professionalRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!pro) {
      throw new NotFoundException(`Professional with id ${id} not found`);
    }
    return pro;
  }

  async getProfessionalByUserId(userId: string): Promise<Professional> {
    const pro = await this.professionalRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!pro) {
      throw new NotFoundException(
        `Professional with userId ${userId} not found`,
      );
    }
    return pro;
  }

  async updateProfessional(
    id: string,
    dto: UpdateProfessionalDto,
  ): Promise<Professional> {
    const pro = await this.getProfessionalById(id);
    Object.assign(pro, dto);
    return this.professionalRepo.save(pro);
  }

  async deactivateProfessional(id: string): Promise<Professional> {
    const pro = await this.getProfessionalById(id);
    pro.isActive = false;
    return this.professionalRepo.save(pro);
  }
}
