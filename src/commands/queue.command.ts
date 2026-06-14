import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class QueueCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'queue', description: '📜 Mostra a fila de músicas atual' })
    public async onQueue(@Context() [interaction]: SlashCommandContext) {
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (!queue.currentTrack && queue.tracks.length === 0) {
            return interaction.reply('📭 A fila está completamente vazia.');
        }

        // Montamos o cabeçalho com a música que está tocando agora
        let message = '**🎵 Tocando Agora:**\n';
        if (queue.currentTrack) {
            message += `> ${queue.currentTrack.info.title}\n\n`;
        }

        // Se tiver músicas na fila de espera, listamos até 10 delas
        if (queue.tracks.length > 0) {
            message += '**📜 Próximas na Fila:**\n';
            
            const tracksToShow = queue.tracks.slice(0, 10);
            tracksToShow.forEach((track, index) => {
                message += `**${index + 1}.** ${track.info.title}\n`;
            });

            if (queue.tracks.length > 10) {
                const remaining = queue.tracks.length - 10;
                message += `\n*...e mais ${remaining} músicas.*`;
            }
        } else {
            message += '\n*📭 A fila de espera está vazia. Adicione mais músicas!*';
        }

        return interaction.reply(message);
    }
}