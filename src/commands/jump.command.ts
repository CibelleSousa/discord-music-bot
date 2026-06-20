import { Injectable } from "@nestjs/common";
import { Context, Options, SlashCommand, IntegerOption } from "necord";
import type { SlashCommandContext } from "necord";
import { AudioService } from "../audio/audio.service";

export class JumpDto {
    @IntegerOption({ name: 'posição', description: 'O número da música na fila para a qual você quer pular', required: true })
    position!: number;
}

@Injectable()
export class JumpCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'jump', description: '🚀 Pula diretamente para uma música específica da fila' })
    public async onJump(
        @Context() [interaction]: SlashCommandContext,
        @Options() { position }: JumpDto
    ) {
        const queue = this.audioService.getQueue(interaction.guildId!);
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);

        if (!player) {
            return interaction.reply({ content: '❌ Eu não estou tocando nada no momento.', ephemeral: true });
        }
        if (position < 1 || position > queue.tracks.length) {
            return interaction.reply({ content: `❌ Posição inválida. Escolha um número entre 1 e ${queue.tracks.length}.`, ephemeral: true });
        }

        const jumpIndex = position - 1;
        const trackToPlay = queue.tracks[jumpIndex];

        queue.tracks.splice(0, jumpIndex);
        queue.isManualStop =  false;

        await player.stopTrack();

        return interaction.reply(`🚀 Pulando diretamente para: **${trackToPlay.info.title}**!`);
    }
}