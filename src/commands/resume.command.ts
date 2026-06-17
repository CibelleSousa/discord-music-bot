import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { GuildMember } from "discord.js";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class ResumeCommand {
    constructor(private readonly audioService: AudioService){}

    @SlashCommand({ name: 'resume', description: '▶️ Retoma a reprodução da música pausada' })
    public async onResume(@Context() [interaction]: SlashCommandContext) {
        const member = interaction.member as GuildMember;
        
        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ Você precisa estar em um canal de voz!', ephemeral: true });
        }

        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        if (!player) {
            return interaction.reply({ content: '❌ Eu não estou conectado em nenhum canal.', ephemeral: true });
        }

        if (!player.paused) {
            return interaction.reply({ content: '⚠️ A música já está tocando!', ephemeral: true });
        }

        await player.setPaused(false);
        return interaction.reply('▶️ Voltando com o som!');
    }
}