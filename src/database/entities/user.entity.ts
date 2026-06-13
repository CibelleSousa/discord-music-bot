import { Entity, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryColumn({ type: 'varchar' })
    id!: string

    @CreateDateColumn()
    created_at!: Date
}