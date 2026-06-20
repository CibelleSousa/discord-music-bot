import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class UnshuffleCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'unshuffle', description: '🔄 Restaura a ordem original da fila' })
    public async onUnshuffle(@Context() [interaction]: SlashCommandContext) {
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (!queue.isShuffled) {
            return interaction.reply({ content: '⚠️ A fila não está embaralhada no momento.', ephemeral: true });
        }

        queue.disableShuffle();

        return interaction.reply('🔄 A ordem original da fila foi restaurada perfeitamente!');
    }
}