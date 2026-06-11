import { Test, TestingModule } from '@nestjs/testing';
import { PingCommand } from './ping.command';

describe('PingCommand', () => {
  let command: PingCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingCommand],
    }).compile();

    command = module.get<PingCommand>(PingCommand);
  });

  it('deve estar definido e instanciado com sucesso', () => {
    expect(command).toBeDefined();
  });
});