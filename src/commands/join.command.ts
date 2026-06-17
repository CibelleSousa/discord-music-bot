import { Injectable } from "@nestjs/common";
import { Context, SlashCommand } from "necord";
import type { SlashCommandContext } from "necord";
import { GuildMember } from "discord.js";
import { AudioService } from "../audio/audio.service";

@Injectable()
export class JoinCommand {
    constructor(private readonly audioService: AudioService){}

    @SlashCommand({name: 'join', description: '🔌 Conecta o bot ao seu canal de voz.'})
    public async onJoin(@Context() [interaction]: SlashCommandContext) {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Você precisa estar em um canal de voz para me chamar!', ephemeral: true});
        }

        const player = this.audioService.shoukaku.players.get(interaction.guildId!);

        if (player && member.guild.members.me?.voice.channelId === voiceChannel.id){
            return interaction.reply({content: '⚠️ Eu já estou conectado no seu canal de voz!', ephemeral: true});
        }

        await this.audioService.shoukaku.joinVoiceChannel({
            guildId: interaction.guildId!,
            channelId: voiceChannel.id,
            shardId: 0
        });

        return interaction.reply(`🔌 Conectado com sucesso ao canal **${voiceChannel.name}**!`);
    }
}