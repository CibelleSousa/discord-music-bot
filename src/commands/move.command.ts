import { Injectable } from "@nestjs/common";
import { Context, Options, SlashCommand, IntegerOption } from "necord";
import type { SlashCommandContext } from "necord";
import { AudioService } from "../audio/audio.service";


export class MoveDto {
    @IntegerOption({ name: 'de', description: 'A posição atual da música (ex: 3)', required: true })
    from!: number;

    @IntegerOption({ name: 'para', description: 'Para qual posição ela deve ir (ex: 1)', required: true })
    to!: number;
}

@Injectable()
export class MoveCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'move', description: '🚚 Move uma música de uma posição para outra na fila' })
    public async onMove(
        @Context() [interaction]: SlashCommandContext,
        @Options() {from, to}: MoveDto
    ) {
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (queue.tracks.length === 0){
            return interaction.reply({ content: '📭 A fila está vazia.', ephemeral: true });
        }
        if (from < 1 || from > queue.tracks.length || to < 1 || to > queue.tracks.length) {
            return interaction.reply({ content: `❌ As posições devem estar entre 1 e ${queue.tracks.length}.`, ephemeral: true });
        }
        if (from === to) {
            return interaction.reply({ content: '⚠️ A música já está nessa posição.', ephemeral: true });
        }

        const fromIndex = from - 1;
        const toIndex = to - 1;

        const [movedTrack] = queue.tracks.splice(fromIndex, 1);

        queue.tracks.splice(toIndex, 0, movedTrack);

        return interaction.reply(`🚚 A música **${movedTrack.info.title}** foi movida para a posição **${to}**!`);
    }
}