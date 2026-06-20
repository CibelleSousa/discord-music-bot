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

        
        if (!voiceChannel) {
            return interaction.reply({ 
                content: '❌ Você precisa estar em um canal de voz para me parar!', 
                ephemeral: true 
            });
        }

        
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);

        if (!player) {
            return interaction.reply({ 
                content: '❌ Eu não estou tocando nada no momento.', 
                ephemeral: true 
            });
        }

        
        const queue = this.audioService.getQueue(interaction.guildId!);
        queue.isManualStop = true;
        queue.tracks = [];
        queue.currentTrack = null;

        if (queue.playerMessage) {
            await queue.playerMessage.delete().catch(() => {});
            queue.playerMessage = null;
        }

        await player.stopTrack();

        return interaction.reply('⏹️ O som foi cortado e a fila foi limpa. Paz e silêncio restaurados!');
    }
}