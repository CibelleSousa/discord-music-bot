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
    // Verificação de segurança: O usuário está em um canal de voz?
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

    // Pega a fila do servidor atual
    const guildId = interaction.guildId!;
    const queue = this.audioService.getQueue(guildId);

    // Separa a lógica de Playlist e Música única
    let responseText = '';

    if (result.loadType === 'playlist') {
      // Se for uma playlist, adiciona todas as musicas na fila
      for (const track of result.data.tracks) {
        queue.enqueue(track);
      }
      responseText = `📚 Adicionando a playlist **${result.data.info.name}** com **${result.data.tracks.length} músicas na fila!**`;
    } else {
      // Se for uma única musica ou pesquisa, pega só a primeira
      const track = result.loadType === 'search' ? result.data[0] : result.data;
      queue.enqueue(track);
      responseText = `🎵 Adicionado à fila: **${track.info.title}**`;
    }

    // verifica se já existe um player rodando neste servidor
    let player = this.audioService.shoukaku.players.get(guildId);

    // Se o bot ainda não estiver no canal de voz, ele entra e configura o piloto automático
    if (!player) {
      player = await this.audioService.shoukaku.joinVoiceChannel({
        guildId: guildId,
        channelId: voiceChannel.id,
        shardId: 0
      });

      // Quando uma música acabar, puxa a próxima da fila e toca
      player.on('end', () => {
        const nextTrack = queue.next();
        if (nextTrack) {
          player!.playTrack({ track: {encoded: nextTrack.encoded } });
        }
      });
    }

    // Se a fila estava parada, damos início ao motor
    if (!queue.currentTrack) {
      const nextTrack = queue.next();
      await player.playTrack({ track: {encoded: nextTrack.encoded } });
    }

    return interaction.editReply(responseText);
  }
}