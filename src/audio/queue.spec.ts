import { Queue } from './queue';

describe('Queue System', () => {
  let queue: Queue;

  // O beforeEach roda antes de CADA teste, garantindo uma fila nova e limpa sempre
  beforeEach(() => {
    queue = new Queue();
  });

  it('deve inicializar com a lista de musicas vazia e sem musica atual', () => {
    expect(queue.tracks.length).toBe(0);
    expect(queue.currentTrack).toBeNull();
  });

  it('deve adicionar uma música no final da fila (enqueue)', () => {
    queue.enqueue('Musica A');
    queue.enqueue('Musica B');

    expect(queue.tracks.length).toBe(2);
    expect(queue.tracks[0]).toBe('Musica A');
  });

  it('deve puxar a proxima musica da fila e defini-la como atual (next)' , () => {
    queue.enqueue('Musica A');
    queue.enqueue('Musica B');

    const proxima = queue.next();

    expect(proxima).toBe('Musica A');
    expect(queue.currentTrack).toBe('Musica A');
    expect(queue.tracks.length).toBe(1);
  });
});