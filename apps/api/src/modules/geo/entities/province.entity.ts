import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { District } from './district.entity';

@Entity('provinces')
export class Province {
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

  @OneToMany(() => District, (d) => d.province)
  districts: District[];

  @CreateDateColumn()
  createdAt: Date;
}
