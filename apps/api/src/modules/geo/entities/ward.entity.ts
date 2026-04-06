import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from 'typeorm';
import { District } from './district.entity';

@Entity('wards')
export class Ward {
  @PrimaryColumn({ type: 'varchar', length: 10 })
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

  @ManyToOne(() => District, (d) => d.wards, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'districtCode', referencedColumnName: 'code' })
  district: District;

  @Column({ type: 'varchar', length: 5 })
  @Index()
  districtCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
