import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, StringOption, Options } from 'necord';
import type { SlashCommandContext } from 'necord';
import { AudioService } from '../audio/audio.service';

export class LoopDto {
    @StringOption({
        name: 'modo',
        description: 'Escolha como você quer repetir a música',
        required: true,
        choices: [
            { name: '🔂 Música Atual (Song)', value: 'song' },
            { name: '🔁 A Fila Inteira (Queue)', value: 'queue' },
            { name: '❌ Desativar Loop (None)', value: 'off' }
        ]
    })
    mode!: 'song' | 'queue' | 'off';
}

@Injectable()
export class LoopCommand {
    constructor(private readonly audioService: AudioService) {}

    @SlashCommand({ name: 'loop', description: '🔁 Configura a repetição de músicas' })
    public async onLoop(
        @Context() [interaction]: SlashCommandContext,
        @Options() { mode }: LoopDto
    ) {
        const queue = this.audioService.getQueue(interaction.guildId!);
        const player = this.audioService.shoukaku.players.get(interaction.guildId!);

        if (!player || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Não há nenhuma música tocando para colocar em loop.', ephemeral: true });
        }

        queue.loopMode = mode;

        let resposta = '';
        if (mode === 'song') resposta = '🔂 **Loop de Música** ativado! Essa faixa vai tocar para sempre.';
        if (mode === 'queue') resposta = '🔁 **Loop de Fila** ativado! A playlist vai recomeçar quando acabar.';
        if (mode === 'off') resposta = '❌ **Loop desativado**! A fila seguirá normalmente.';

        // Opcional de Ouro: Atualizar a Interface do Player no chat para refletir a mudança!
        if (queue.playerMessage) {
            const ui = this.audioService.buildPlayerUi(queue.currentTrack, player.paused, queue);
            await queue.playerMessage.edit(ui).catch(() => {});
        }

        return interaction.reply({ content: resposta, ephemeral: false });
    }
}