import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class ClearCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'clear', description: '🗑 Limpa todas as músicas da fila de espera' })
    public async onClear(@Context() [interaction]: SlashCommandContext) {
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (queue.tracks.length === 0) {
            return interaction.reply({ content: '📭 A fila de espera já está vazia!', ephemeral: true });
        }

        const removedCount = queue.tracks.length;

        queue.tracks = [];

        return interaction.reply(`🗑️ Fila limpa! **${removedCount}** músicas foram removidas da espera.`);
    }
}