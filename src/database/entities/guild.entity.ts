import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('guilds')
export class Guild {
    @PrimaryColumn({ type: 'varchar' })
    id!: string

    @Column({ type: 'boolean', default: true })
    is_active!: boolean

    @Column({ type: 'boolean', default: false })
    is_24_7!: boolean;

    @Column({ type: 'int', default: 100 })
    default_volume!: number

    @Column({ type: 'varchar', nullable: true })
    dj_role_id!: string | null
}