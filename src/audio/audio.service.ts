import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Shoukaku, Connectors } from 'shoukaku';
import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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

    // Nossa interface
    public buildPlayerUi(track: any, isPaused: boolean = false, queue: Queue) {
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: '🎧 Tocando Agora' })
            .setTitle(`${track.info.author} - ${track.info.title}`)
            .setURL(track.info.uri || null)

        let thumbnailUrl = track.info.artworkUrl;
        if (!thumbnailUrl && track.info.sourceName === 'youtube') {
            // O YouTube sempre guarda a capa de alta qualidade (hqdefault) nesse endereço exato:
            thumbnailUrl = `https://i.ytimg.com/vi/${track.info.identifier}/hqdefault.jpg`;
        }
        if (thumbnailUrl) {
            embed.setThumbnail(thumbnailUrl);
        }

        const formatTime = (ms: number) => {
            const totalSeconds = Math.floor(ms / 1000);
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        const duration = track.info.isStream ? '🔴 AO VIVO' : formatTime(Number(track.info.length) || 0);

        let description = '';
        if (queue.requesterId) {
            description += `Adicionado por <@${queue.requesterId}>\n`;
        }
        description += `⏱️ **Duração:** \`${duration}\``;
        embed.setDescription(description);

        let loopLabel = '◦';
        let loopEmoji = '1517921153979519088';
        let loopStyle = ButtonStyle.Secondary;

        if (queue.loopMode === 'queue') {
            loopLabel = '•';
            loopStyle = ButtonStyle.Primary;
        } else if (queue.loopMode === 'song') {
            loopLabel = '•';
            loopEmoji = '1517921184363053117';
            loopStyle = ButtonStyle.Primary;
        }

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('player_shuffle_toggle')
                .setEmoji('1517921262444478585')
                .setLabel(queue.isShuffled ? '•' : '◦')
                .setStyle(queue.isShuffled ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('player_back')
                .setEmoji('1517921284250538094')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('player_pause')
                .setEmoji(isPaused? '1517921129065611357' : '1517921073369186535')
                .setLabel(isPaused ? 'Retomar' : 'Pausar')
                .setStyle(isPaused ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('player_skip')
                .setEmoji('1517921303825350796')
                .setLabel('Pular')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('player_loop_toggle')
                .setEmoji(loopEmoji)
                .setLabel(loopLabel)
                .setStyle(loopStyle),
            
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('player_stop')
                .setEmoji('1517921328978727134')
                .setLabel('Parar')
                .setStyle(ButtonStyle.Secondary)
        );

        return { embeds: [embed], components: [row1, row2], allowedMentions: { parse: [] } };
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