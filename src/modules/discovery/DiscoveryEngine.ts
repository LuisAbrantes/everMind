export type DiscoveryCategory =
  | 'MUSIC'
  | 'READING'
  | 'DRAWING'
  | 'GARDENING'
  | 'RECIPE'
  | 'NEW_WORD'
  | 'PHOTOGRAPHY';

export interface IDiscoveryItem {
  id: string;
  category: DiscoveryCategory;
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  description: string;
  practicalTip: string;
}

export const DISCOVERY_CATALOG: IDiscoveryItem[] = [
  // Música
  {
    id: 'disc_music_bossa',
    category: 'MUSIC',
    categoryLabel: 'Música & Melodia',
    categoryIcon: '🎵',
    title: 'Escute um clássico da Bossa Nova',
    description: 'Ouça uma canção relaxante de Tom Jobim ou Nara Leão fechando os olhos por alguns instantes.',
    practicalTip: 'Perceba o ritmo suave do violão e a respiração calma que a música proporciona.',
  },
  {
    id: 'disc_music_whistle',
    category: 'MUSIC',
    categoryLabel: 'Música & Melodia',
    categoryIcon: '🎵',
    title: 'Assobie ou cante uma canção da infância',
    description: 'Traga à memória uma cantiga de roda ou melodia afetiva que seus pais ou avós cantavam.',
    practicalTip: 'Cantarolar estimula a memória auditiva e libera hormônios de bem-estar.',
  },

  // Leitura
  {
    id: 'disc_reading_poem',
    category: 'READING',
    categoryLabel: 'Leitura & Poesia',
    categoryIcon: '📖',
    title: 'Leia um poema de Cecília Meireles',
    description: 'Aprecie a sutileza das palavras e o ritmo poético lendo com calma em voz alta.',
    practicalTip: 'Ler em voz alta exercita a dicção, fluência verbal e foco atencioso.',
  },
  {
    id: 'disc_reading_short_story',
    category: 'READING',
    categoryLabel: 'Leitura & Poesia',
    categoryIcon: '📖',
    title: 'Releia uma crônica carinhosa',
    description: 'Leia uma crônica breve sobre o cotidiano ou folheie um livro que você adora.',
    practicalTip: 'A leitura diária mantém as conexões sinápticas jovens e flexíveis.',
  },

  // Desenho & Artesanato
  {
    id: 'disc_drawing_mandala',
    category: 'DRAWING',
    categoryLabel: 'Desenho & Arte',
    categoryIcon: '🎨',
    title: 'Desenhe formas livres no papel',
    description: 'Pegue papel e lápis de cor para fazer traços suaves, espirais ou colorir uma forma geométrica.',
    practicalTip: 'Não se preocupe com perfeição: o ato de rabiscar e colorir relaxa o sistema nervoso.',
  },

  // Jardinagem
  {
    id: 'disc_gardening_plants',
    category: 'GARDENING',
    categoryLabel: 'Jardinagem & Natureza',
    categoryIcon: '🌿',
    title: 'Converse com suas plantas por 3 minutos',
    description: 'Observe as folhas novas de um vaso no seu quintal ou janela e retire folhas secas com carinho.',
    practicalTip: 'O contato com a terra e plantas reduz a ansiedade e conecta ao presente.',
  },

  // Culinária Saudável
  {
    id: 'disc_recipe_tea',
    category: 'RECIPE',
    categoryLabel: 'Culinária & Sabor',
    categoryIcon: '🍳',
    title: 'Prepare uma infusão aromática com ervas',
    description: 'Faça um chá suave de camomila, erva-doce ou hortelã fresca e sinta o aroma subindo.',
    practicalTip: 'Aprecie o cheiro das ervas antes do primeiro gole: estimula o olfato e acalma a mente.',
  },

  // Palavra Nova
  {
    id: 'disc_new_word_serendipity',
    category: 'NEW_WORD',
    categoryLabel: 'Palavra Nova',
    categoryIcon: '📝',
    title: 'Descubra a palavra: "Serenidade"',
    description: 'Do latim serenitas: estado daquele que é tranquilo, límpido, sereno e sem perturbações.',
    practicalTip: 'Respire fundo três vezes e diga para si mesmo: "Hoje escolho a serenidade".',
  },

  // Fotografia & Observação
  {
    id: 'disc_photo_sky',
    category: 'PHOTOGRAPHY',
    categoryLabel: 'Fotografia & Olhar',
    categoryIcon: '📷',
    title: 'Fotografe ou contemple o formato das nuvens',
    description: 'Olhe para o céu da sua janela por 2 minutos e encontre desenhos ou formas nas nuvens.',
    practicalTip: 'A observação do céu expande a percepção visual e desperta a imaginação lúdica.',
  },
];

export class DiscoveryEngine {
  public static rollSurprise(
    excludedIds: string[] = [],
    selectedCategory: DiscoveryCategory | 'ALL' = 'ALL'
  ): IDiscoveryItem {
    let pool = DISCOVERY_CATALOG;
    if (selectedCategory !== 'ALL') {
      pool = pool.filter((item) => item.category === selectedCategory);
    }

    const available = pool.filter((item) => !excludedIds.includes(item.id));
    const finalPool = available.length > 0 ? available : pool;

    const randomIndex = Math.floor(Math.random() * finalPool.length);
    return finalPool[randomIndex];
  }

  public static getCategories(): { category: DiscoveryCategory; label: string; icon: string }[] {
    return [
      { category: 'MUSIC', label: 'Música', icon: '🎵' },
      { category: 'READING', label: 'Leitura', icon: '📖' },
      { category: 'DRAWING', label: 'Desenho', icon: '🎨' },
      { category: 'GARDENING', label: 'Jardinagem', icon: '🌿' },
      { category: 'RECIPE', label: 'Culinária', icon: '🍳' },
      { category: 'NEW_WORD', label: 'Palavra Nova', icon: '📝' },
      { category: 'PHOTOGRAPHY', label: 'Fotografia', icon: '📷' },
    ];
  }
}
