import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, CreateDateColumn, Index, JoinColumn } from 'typeorm';
import { Province } from './province.entity';
import { Ward } from './ward.entity';

@Entity('districts')
export class District {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  code: string;

  @Column()
  name: string;

  @Column()
  nameEn: string;

  @Column()
  fullName: string;

  @Column()
  fullNameEn: string;

  @Column()
  codeName: string;

  @Column({ type: 'varchar', length: 30 })
  type: string;

  @Column({ type: 'varchar', nullable: true, insert: false, update: false })
  nameSearch: string;

  @ManyToOne(() => Province, (p) => p.districts, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'provinceCode', referencedColumnName: 'code' })
  province: Province;

  @Column({ type: 'varchar', length: 5 })
  @Index()
  provinceCode: string;

  @OneToMany(() => Ward, (w) => w.district)
  wards: Ward[];

  @CreateDateColumn()
  createdAt: Date;
}
