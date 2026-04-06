import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepo: Repository<Ward>,
  ) {}

  async findAllProvinces() {
    return this.provinceRepo.find({ order: { name: 'ASC' } });
  }

  async findProvinceByCode(code: string) {
    return this.provinceRepo.findOne({
      where: { code },
      relations: ['districts'],
    });
  }

  async findDistrictsByProvince(provinceCode: string) {
    return this.districtRepo.find({
      where: { provinceCode },
      order: { name: 'ASC' },
    });
  }

  async findDistrictByCode(code: string) {
    return this.districtRepo.findOne({
      where: { code },
      relations: ['wards'],
    });
  }

  async findWardsByDistrict(districtCode: string) {
    return this.wardRepo.find({
      where: { districtCode },
      order: { name: 'ASC' },
    });
  }

  async findWardByCode(code: string) {
    return this.wardRepo.findOne({ where: { code } });
  }

  async search(query: string) {
    const q = query.trim();
    if (!q) return { provinces: [], districts: [], wards: [] };

    const provinces = await this.provinceRepo
      .createQueryBuilder('p')
      .where("f_unaccent(lower(p.name)) LIKE f_unaccent(lower(:q))", { q: `%${q}%` })
      .orderBy('p.name', 'ASC')
      .limit(10)
      .getMany();

    const districts = await this.districtRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.province', 'p')
      .where("f_unaccent(lower(d.name)) LIKE f_unaccent(lower(:q))", { q: `%${q}%` })
      .orderBy('d.name', 'ASC')
      .limit(10)
      .getMany();

    const wards = await this.wardRepo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.district', 'd')
      .where("f_unaccent(lower(w.name)) LIKE f_unaccent(lower(:q))", { q: `%${q}%` })
      .orderBy('w.name', 'ASC')
      .limit(10)
      .getMany();

    return { provinces, districts, wards };
  }
}
