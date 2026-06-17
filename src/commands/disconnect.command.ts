import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { GuildMember } from "discord.js";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class DisconnectCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({name: 'disconnect', description: '👋 Desconecta o bot do canal de voz e limpa a fila'})
    private async onDisconnect(@Context() [interaction]: SlashCommandContext){
        const member = interaction.member as GuildMember;

        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ Você precisa estar em um canal de voz para me desconectar!', ephemeral: true });
        }

        const player = this.audioService.shoukaku.players.get(interaction.guildId!);
        if (!player) {
            return interaction.reply({ content: '❌ Eu não estou conectado em nenhum canal.', ephemeral: true });
        }

        const queue = this.audioService.getQueue(interaction.guildId!);
        queue.isManualStop =  true;
        queue.tracks = [];
        queue.currentTrack = null;

        if (queue.timeout) {
            clearTimeout(queue.timeout);
            queue.timeout = null;
        }

        await this.audioService.shoukaku.leaveVoiceChannel(interaction.guildId!);

        return interaction.reply('🤸‍♂️ Fui desconectado! Até a próxima.');
    }
}