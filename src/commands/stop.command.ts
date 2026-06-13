import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GuildMember } from 'discord.js';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class StopCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'stop', description: '⏹️ Para a música, esvazia a fila e desconecta o bot' })
    public async onStop(@Context() [interaction]: SlashCommandContext) {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        // 1. Verifica se o usuário está no canal de voz
        if (!voiceChannel) {
        return interaction.reply({ 
            content: '❌ Você precisa estar em um canal de voz para me parar!', 
            ephemeral: true 
        });
        }

        // 2. Busca o reprodutor de áudio (player) ativo neste servidor
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);

        if (!player) {
        return interaction.reply({ 
            content: '❌ Eu não estou tocando nada no momento.', 
            ephemeral: true 
        });
        }

        // 3. Destrói o player. Isso encerra a conexão de voz e para qualquer áudio imediatamente.
        await this.audioService.shoukaku.leaveVoiceChannel(interaction.guildId!);

        return interaction.reply('⏹️ O som foi cortado e eu saí do canal. Paz e silêncio restaurados!');
    }
}