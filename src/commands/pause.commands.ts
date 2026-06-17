import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { GuildMember } from "discord.js";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class PauseCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({name: 'pause', description: '⏸️ Pausa a música atual'})
    public async onPause(@Context() [interaction]: SlashCommandContext) {
        const member = interaction.member as GuildMember;

        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ Você precisa estar em um canal de voz!', ephemeral: true} );
        }

        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        if (!player) {
            return interaction.reply({ content: '⚠️ A música já está pausada!', ephemeral: true });
        }

        await player.setPaused(true);
        return interaction.reply('⏸️ Música pausada! Digite `/resume` para continuar.');
    }
}