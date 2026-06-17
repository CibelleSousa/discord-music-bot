import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class NowPlayingCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({name: 'now-playing', description: '🎧 Mostra os detalhes e o progresso da música atual'})
    public async onNowPlaying(@Context() [interaction]: SlashCommandContext) {
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        const queue = this.audioService.getQueue(interaction.guildId!);

        if (!player || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Não tem nenhuma música tocando no momento.', ephemeral: true });
        }

        const track = queue.currentTrack;

        const currentPosition = player.position || 0;
        const totalLength = parseInt(track.info.length) || 0;
        const isStream = track.info.isStream;

        const formatTime = (ms: number) => {
            const totalSeconds = Math.floor(ms / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        let timeText = '';

        if (isStream) {
            timeText = '🔴 **AO VIVO**';
        } else {
            timeText = `⏱️ **Tempo:** \`${formatTime(currentPosition)} / ${formatTime(totalLength)}\``;
        }

        const uri = track.info.uri ? track.info.uri : '#';
        const message = `**🎶 Tocando Agora:**\n> **[${track.info.title}](${uri})**\n> 👤 *Por: ${track.info.author}*\n${timeText}`;

        return interaction.reply(message);

    }
}