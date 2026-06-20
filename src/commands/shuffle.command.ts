import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type  { SlashCommandContext } from 'necord';
import { AudioService } from '../audio/audio.service';

@Injectable()
export class ShuffleCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'shuffle', description: '🔀 Embaralha as músicas da fila de espera' })
    public async onShuffle(@Context() [interaction]: SlashCommandContext) {
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (queue.isShuffled){
            return interaction.reply({ content: '⚠️ A fila já está embaralhada! Use `/unshuffle` para restaurar.', ephemeral: true });
        }

        if (queue.tracks.length < 2) {
            return interaction.reply({ 
            content: '⚠️ Você precisa de pelo menos 2 músicas na fila para poder embaralhar!', 
            ephemeral: true 
            });
        }

        queue.enableShuffle();

        // Algoritmo de Fisher-Yates para embaralhar o array
        for (let i = queue.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
        }

        return interaction.reply('🔀 Fila embaralhada com sucesso! Use `/queue` para ver a nova bagunça.');
    }
}