import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Shoukaku, Connectors } from 'shoukaku';
import { Client } from 'discord.js';
import { Queue } from './queue';

@Injectable()
export class AudioService implements OnModuleInit {
    // A propriedade que vai guardar o nosso gerenciador de música
    public shoukaku!: Shoukaku;
    
    // Um logger nativo do NestJS para deixar as mensagens bonitas no terminal
    private readonly logger = new Logger(AudioService.name);

    // Cria o mapa de filas (ID do Servidor -> Fila)
    public readonly queues = new Map<string, Queue>();

    constructor(
        private readonly client: Client,
        private readonly configService: ConfigService,
    ) {}

    // Método para pegar ou criar a fila de um servidor
    public getQueue(guildId: string): Queue {
        if(!this.queues.has(guildId)) {
            this.queues.set(guildId, new Queue());
        }
        return this.queues.get(guildId)!;
    }

    // Esse método roda automaticamente assim que o bot liga
    onModuleInit() {
        const nodes = [{
            name: this.configService.getOrThrow<string>('LAVALINK_NAME'),
            url: this.configService.getOrThrow<string>('LAVALINK_URL'),
            auth: this.configService.getOrThrow<string>('LAVALINK_PASSWORD'),
        },
        ];

        // Iniciamos a ponte entre o Discord.js e o Lavalink
        this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this.client), nodes, {
        moveOnDisconnect: false,
        resume: true,
        resumeByLibrary: true,
        reconnectTries: 5,
        });

        // Eventos para sabermos se deu certo ou se explodiu
        this.shoukaku.on('ready', (name) => 
        this.logger.log(`🎵 Lavalink Node: ${name} conectado com sucesso!`)
        );
        
        this.shoukaku.on('error', (name, error) => 
        this.logger.error(`❌ Lavalink Node: ${name} gerou um erro.`, error)
        );
        
        this.shoukaku.on('close', (name, code, reason) => 
        this.logger.warn(`⚠️ Lavalink Node: ${name} fechou. Código: ${code}. Motivo: ${reason}`)
        );
    }
}