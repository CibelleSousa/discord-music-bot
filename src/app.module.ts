import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { PingCommand } from './ping.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './database/entities/guild.entity';

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
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Guild])
  ],
  controllers: [],
  providers: [PingCommand],
})
export class AppModule {}
