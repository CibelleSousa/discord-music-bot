import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Playlist } from './playlist.entity';

@Entity('tracks')
export class Track {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    title!: string;

    @Column({ type: 'varchar' })
    url!: string;

    @Column({ type: 'int' })
    position!: number;

    @ManyToOne(() => Playlist, (playlist) => playlist.tracks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playlist_id' })
    playlist!: Playlist;
}