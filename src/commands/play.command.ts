import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, StringOption } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GuildMember } from 'discord.js';
import { AudioService } from '../audio/audio.service';

// Define o que o usuário precisa digitar no Discord
export class PlayDto {
  @StringOption({
    name: 'musica',
    description: 'O nome da música ou o link do YouTube/Spotify',
    required: true,
  })
  query!: string;
}

@Injectable()
export class PlayCommand {
  constructor(private readonly audioService: AudioService) {}

  @SlashCommand({ name: 'play', description: '🎵 Toca uma música no canal de voz' })
  public async onPlay(
    @Context() [interaction]: SlashCommandContext,
    @Options() { query }: PlayDto,
  ) {
    // 1. Verificação de segurança: O usuário está em um canal de voz?
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ Você precisa entrar em um canal de voz primeiro!', 
        ephemeral: true 
      });
    }

    // Avisamos ao Discord que estamos processando (evita que o comando dê "falha ao responder")
    await interaction.deferReply();

    // 2. Busca o motor de áudio disponível
    const node = this.audioService.shoukaku.getIdealNode();
    if (!node) {
      return interaction.editReply('❌ Nenhum servidor de áudio disponível no momento.');
    }

    // 3. Pesquisa a música (se não for link, forçamos a busca no YouTube)
    const search = query.startsWith('http') ? query : `ytsearch:${query}`;
    const result = await node.rest.resolve(search);

    if (!result || result.loadType === 'empty' || result.loadType === 'error') {
      return interaction.editReply('❌ Nenhuma música encontrada com esse nome.');
    }

    // Extrai a primeira música do resultado (dependendo se é playlist ou pesquisa)
    let track;
    if (result.loadType === 'playlist') {
      track = result.data.tracks[0];
    } else if (result.loadType === 'search') {
      track = result.data[0];
    } else {
      track = result.data; // É um link direto
    }

    // 4. Entra no canal de voz e toca a música
    const player = await this.audioService.shoukaku.joinVoiceChannel({
      guildId: interaction.guildId!,
      channelId: voiceChannel.id,
      shardId: 0, // O Discord divide os bots grandes em "shards", padrão é 0
    });

    await player.playTrack({ track: { encoded: track.encoded } });

    return interaction.editReply(`🎶 Tocando agora: **${track.info.title}**`);
  }
}