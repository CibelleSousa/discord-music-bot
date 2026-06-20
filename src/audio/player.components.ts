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

        const ui = this.audioService.buildPlayerUi(queue.currentTrack, isPaused, queue);

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

    @Button('player_back')
    public async onBack(@Context() [interaction]: ButtonContext){
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (!player) return interaction.reply({ content: '❌ Nada tocando.', ephemeral: true });
        if (queue.history.length === 0) return interaction.reply({ content: '⚠️ Não há músicas anteriores no histórico!', ephemeral: true });

        await interaction.deferUpdate();

        const previousTrack = queue.history.pop();
        if (queue.currentTrack) {
            queue.tracks.unshift(queue.currentTrack);
        }
        queue.tracks.unshift(previousTrack);

        queue.currentTrack = null;

        await player.stopTrack();
    }

    @Button('player_shuffle_toggle')
    public async onShuffleToggle(@Context() [interaction]: ButtonContext) {
        const queue = this.audioService.getQueue(interaction.guildId!);
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
    
        if (!player || !queue.currentTrack) return interaction.reply({ content: '❌ Nada tocando.', ephemeral: true });

        if (queue.isShuffled) {
            queue.disableShuffle();
        } else {
            if (queue.tracks.length < 2) return interaction.reply({ content: '⚠️ Poucas músicas para embaralhar!', ephemeral: true });
            queue.enableShuffle();
        
            for (let i = queue.tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
            }
        }

        const ui = this.audioService.buildPlayerUi(queue.currentTrack, player.paused, queue);
        await interaction.update(ui);
    }

    @Button('player_loop_toggle')
    public async onLoopToggle(@Context() [interaction]: ButtonContext) {
        const queue = this.audioService.getQueue(interaction.guildId!);
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
    
        if (!player || !queue.currentTrack) return interaction.reply({ content: '❌ Nada tocando.', ephemeral: true });

        if (queue.loopMode === 'off') {
            queue.loopMode = 'queue';
        } else if (queue.loopMode === 'queue') {
            queue.loopMode = 'song';
        } else {
            queue.loopMode = 'off';
        }

        const ui = this.audioService.buildPlayerUi(queue.currentTrack, player.paused, queue);
        await interaction.update(ui);
    }
}