import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GuildMember } from 'discord.js';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class SkipCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'skip', description: '⏭️ Pula para a próxima música da fila' })
    public async onSkip(@Context() [interaction]: SlashCommandContext) {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Você precisa estar em um canal de voz!', ephemeral: true });
        }

        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        if (!player) {
            return interaction.reply({ content: '❌ Eu não estou tocando nada no momento.', ephemeral: true });
        }

        // Pede ao Lavalink para parar a faixa atual. 
        // Isso vai disparar o nosso evento 'end' no comando play automaticamente e tocar a próxima!
        await player.stopTrack();

        return interaction.reply('⏭️ Opa! Você pulou a música.');
    }
}