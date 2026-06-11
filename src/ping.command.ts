import { Injectable } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';

@Injectable()
export class PingCommand {
  @SlashCommand({ 
    name: 'ping', 
    description: 'Response whit Pont to test the bot latency' 
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: 'Pong! 🏓 M.A.R.K is alive and breathing!' });
  }
}