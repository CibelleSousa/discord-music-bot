import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { PingCommand } from './ping.command';
import { Commands } from './commands';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities } from './database';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Conexão com o banco de dados
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true // Cria as tabelas no banco de dados automaticamente (apenas para desenvolvimento!)
      }),
    }),

    // Conexão com Discord
    NecordModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow<string>('DISCORD_TOKEN'),
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildVoiceStates,
        ],
        development: [configService.getOrThrow<string>('DISCORD_DEV_GUILD_ID')]
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Entities.Guild, Entities.User, Entities.Track, Entities.Playlist]),
    AudioModule
  ],
  controllers: [],
  providers: [ 
    PingCommand,
    Commands.PlayCommand,
    Commands.StopCommand,
    Commands.QueueCommand,
    Commands.SkipCommand ,
    Commands.PauseCommand,
    Commands.ResumeCommand,
    Commands.JoinCommand,
    Commands.DisconnectCommand,
    Commands.NowPlayingCommand,
    Commands.ClearCommand,
    Commands.ShuffleCommand,
    Commands.UnshuffleCommand,
    Commands.MoveCommand,
    Commands.JumpCommand
  ],
})
export class AppModule {}
