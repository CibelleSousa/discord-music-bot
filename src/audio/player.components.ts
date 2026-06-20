import { Injectable } from "@nestjs/common";
import { Button, Context } from "necord";
import type { ButtonContext } from "necord";
import { AudioService } from "./audio.service";

@Injectable()
export class PlayerComponents {
    constructor(private readonly audioService: AudioService) {}

    @Button('player_pause')
    public async onPause(@Context() [interaction]: ButtonContext) {
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (!player || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Nada tocando.', ephemeral: true });
        }

        const isPaused = !player.paused;
        await player.setPaused(isPaused);

        const ui = this.audioService.buildPlayerUi(queue.currentTrack, isPaused);

        await interaction.update(ui);
    }

    @Button('player_skip')
    public async onSkip(@Context() [interaction]: ButtonContext) {
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        
        if (!player) return interaction.reply({ content: '❌ Nada tocando.', ephemeral: true });

        await interaction.deferUpdate();

        await player.stopTrack();
    }

    @Button('player_stop')
    public async onStop(@Context() [interaction]: ButtonContext) {
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (!player) return interaction.reply({ content: '❌ Nada tocando.', ephemeral: true });

        queue.isManualStop = true;
        queue.tracks = [];
        queue.currentTrack =  null;

        if (queue.playerMessage) {
            await queue.playerMessage.delete().catch(() => {});
            queue.playerMessage = null;
        }

        await player.stopTrack();
        return interaction.reply({ content: '⏹️ Música parada e fila limpa!', ephemeral: true });
    }
}