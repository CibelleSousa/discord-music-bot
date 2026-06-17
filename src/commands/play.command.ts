import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, StringOption } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GuildMember, TextChannel } from 'discord.js';
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
    //  Verificação de segurança: O usuário está em um canal de voz?
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
    queue.isManualStop = false;

    // Salva o canal atual na fila e cancela qualquer cronometro de inatividade
    queue.textChannel = interaction.channel;
    queue.requesterId = interaction.user.id;
    if (queue.timeout) {
      clearTimeout(queue.timeout);
      queue.timeout =  null;
    }

    // Separa a lógica de Playlist e Música única
    let responseText = '';

    // Se for uma playlist, adiciona todas as musicas na fila
    if (result.loadType === 'playlist') {
      // Filtra videos fantasmas 
      const validTracks = result.data.tracks.filter((track: any) => {
        const title = track.info.title.toLowerCase();
        const isGhostTitle = title.includes('private') || 
                             title.includes('deleted') || 
                             title.includes('privado') || 
                             title.includes('indisponível') || 
                             title.includes('unavailable');
        return track.info.length > 0 && !isGhostTitle;
      });
      
      for (const track of validTracks) {
        queue.enqueue(track);
      }
      responseText = `📚 Adicionando a playlist **${result.data.info.name}** com **${result.data.tracks.length} músicas na fila!**`;

      const hiddenCount = result.data.tracks.length - validTracks.length;
      if (hiddenCount > 0) {
        responseText += `*Ignoramos ${hiddenCount} faixas ocultas/excluídas*.`
      }

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
        // Verifica se é um stop disparado pelo comando /stop
        if (queue.isManualStop) return;

        const nextTrack = queue.next();
        if (nextTrack) {
          player!.playTrack({ track: {encoded: nextTrack.encoded } });
        } else {
          if (queue.textChannel) {
            const ping = queue.requesterId ? `<@${queue.requesterId}>` : '';
            queue.textChannel.send(`🏁 ${ping} A fila de músicas acabou! O bot será desconectado em **2 minutos** por inatividade.`);
          }

          queue.timeout = setTimeout(async () => {
            const currentPlayer = this.audioService.shoukaku.players.get(guildId);
            if (currentPlayer) {
              queue.tracks = [];
              queue.currentTrack = null;
              await this.audioService.shoukaku.leaveVoiceChannel(guildId);

              if (queue.textChannel) {
                queue.textChannel.send('💤 Fiquei inativo por muito tempo e me desconectei. Até a próxima!');
              }

            }
          }, 2 * 60 * 1000);
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