/* ============================================================================
   everMind Web — js/domain/discovery-engine.js
   Portagem de `src/modules/discovery/DiscoveryEngine.ts` + anti-repetição.

   Descoberta Surpresa: sorteio aleatório de uma curiosidade/hobby entre
   7 áreas de interesse. Catálogo 100% offline (nenhuma chamada de rede).
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /** Catálogo de descobertas — mínimo de 4 itens por categoria (pt-BR). */
  var DISCOVERY_CATALOG = [
    {
      id: "disc_music_bossa",
      category: 'MUSIC',
      categoryLabel: 'Música & Melodia',
      categoryIcon: '🎵',
      title: "Escute um clássico da Bossa Nova",
      description: "Ouça uma canção de Tom Jobim ou Nara Leão. Se quiser, feche os olhos por alguns instantes.",
      practicalTip: "Repare no violão: ele marca um ritmo suave, como uma conversa tranquila.",
    },
    {
      id: "disc_music_whistle",
      category: 'MUSIC',
      categoryLabel: 'Música & Melodia',
      categoryIcon: '🎵',
      title: "Assobie ou cante uma canção da infância",
      description: "Lembre de uma cantiga de roda que alguém da família cantava. Cantarole baixinho, do seu jeito.",
      practicalTip: "Não precisa lembrar a letra toda. Vale cantarolar só a melodia.",
    },
    {
      id: "disc_music_choro",
      category: 'MUSIC',
      categoryLabel: 'Música & Melodia',
      categoryIcon: '🎵',
      title: "Conheça o som do choro",
      description: "Procure uma música de Pixinguinha, como \"Carinhoso\". Ouça uma vez e tente achar o som da flauta.",
      practicalTip: "O choro nasceu no Rio de Janeiro. Veja se você acompanha o pandeiro com os dedos.",
    },
    {
      id: "disc_music_festa_junina",
      category: 'MUSIC',
      categoryLabel: 'Música & Melodia',
      categoryIcon: '🎵',
      title: "Uma tarde de música junina",
      description: "Escolha uma música de festa junina, como \"Asa Branca\". Ouça e bata palmas no ritmo.",
      practicalTip: "Tente notar qual instrumento aparece primeiro: sanfona, zabumba ou triângulo.",
    },
    {
      id: "disc_music_batida",
      category: 'MUSIC',
      categoryLabel: 'Música & Melodia',
      categoryIcon: '🎵',
      title: "Descubra o ritmo com as mãos",
      description: "Ouça uma música de que você gosta e bata o ritmo na mesa, com calma, por um minuto.",
      practicalTip: "Comece devagar. Se errar o ritmo, é só recomeçar, sem pressa.",
    },
    {
      id: "disc_reading_poem",
      category: 'READING',
      categoryLabel: 'Leitura & Poesia',
      categoryIcon: '📖',
      title: "Leia um poema de Cecília Meireles",
      description: "Peça emprestado ou procure um livro de poemas de Cecília Meireles. Escolha um poema curto e leia devagar, em voz alta.",
      practicalTip: "Leia duas vezes: na primeira, só escute o som das palavras; na segunda, repare nas imagens.",
    },
    {
      id: "disc_reading_short_story",
      category: 'READING',
      categoryLabel: 'Leitura & Poesia',
      categoryIcon: '📖',
      title: "Releia uma crônica carinhosa",
      description: "Leia uma crônica curta sobre o dia a dia, de Rubem Braga ou Fernando Sabino, ou folheie um livro que você adora.",
      practicalTip: "Se uma frase tocar você, sublinhe ou copie num papel.",
    },
    {
      id: "disc_reading_exile",
      category: 'READING',
      categoryLabel: 'Leitura & Poesia',
      categoryIcon: '📖',
      title: "Leia em voz alta a \"Canção do Exílio\"",
      description: "Gonçalves Dias escreveu: \"Minha terra tem palmeiras, onde canta o Sabiá; as aves, que aqui gorjeiam, não gorjeiam como lá.\" Leia esses versos devagar e pense num lugar querido.",
      practicalTip: "Pense em um cheiro ou som do lugar onde você cresceu.",
    },
    {
      id: "disc_reading_casimiro",
      category: 'READING',
      categoryLabel: 'Leitura & Poesia',
      categoryIcon: '📖',
      title: "Visite a infância com Casimiro de Abreu",
      description: "Em \"Meus Oito Anos\", ele escreveu: \"Oh! que saudades que tenho da aurora da minha vida, da minha infância querida que os anos não trazem mais!\" Leia em voz alta e lembre de uma brincadeira sua.",
      practicalTip: "Conte essa lembrança para alguém, ou escreva uma frase sobre ela.",
    },
    {
      id: "disc_reading_machado",
      category: 'READING',
      categoryLabel: 'Leitura & Poesia',
      categoryIcon: '📖',
      title: "Um minuto com Machado de Assis",
      description: "Procure um conto curto de Machado de Assis, como \"Um Apólogo\" (\"A Agulha e a Linha\"). Leia com calma, só o começo, se preferir.",
      practicalTip: "Você pode ler um pedacinho hoje e continuar outro dia.",
    },
    {
      id: "disc_drawing_mandala",
      category: 'DRAWING',
      categoryLabel: 'Desenho & Arte',
      categoryIcon: '🎨',
      title: "Desenhe formas livres no papel",
      description: "Pegue papel e lápis de cor. Faça traços suaves, espirais ou colora uma forma redonda.",
      practicalTip: "Não existe certo ou errado. O prazer está em ver as cores se encontrando.",
    },
    {
      id: "disc_drawing_window",
      category: 'DRAWING',
      categoryLabel: 'Desenho & Arte',
      categoryIcon: '🎨',
      title: "Desenhe o que você vê da janela",
      description: "Escolha um cantinho da janela, como uma árvore, um telhado ou o céu. Desenhe de forma simples, em poucos minutos.",
      practicalTip: "Comece pelo contorno maior e depois acrescente os detalhes.",
    },
    {
      id: "disc_drawing_hand",
      category: 'DRAWING',
      categoryLabel: 'Desenho & Arte',
      categoryIcon: '🎨',
      title: "Desenhe a sua mão",
      description: "Apoie a mão no papel e contorne com o lápis. Depois enfeite os dedos com listras ou flores.",
      practicalTip: "Use as cores de que mais gosta hoje.",
    },
    {
      id: "disc_craft_paper_boat",
      category: 'DRAWING',
      categoryLabel: 'Desenho & Arte',
      categoryIcon: '🎨',
      title: "Dobre um barquinho de papel",
      description: "Pegue uma folha de papel e dobre um barquinho, como se fazia na infância. Se esquecer o passo seguinte, invente o seu.",
      practicalTip: "Depois, que tal colocar o barquinho numa bacia com água?",
    },
    {
      id: "disc_craft_collage",
      category: 'DRAWING',
      categoryLabel: 'Desenho & Arte',
      categoryIcon: '🎨',
      title: "Faça uma colagem com recortes",
      description: "Recorte figuras de revistas antigas que chamem sua atenção. Cole no papel formando uma pequena cena.",
      practicalTip: "Escolha só o que lhe agrada. Dá para fazer em dez minutos.",
    },
    {
      id: "disc_gardening_plants",
      category: 'GARDENING',
      categoryLabel: 'Jardinagem & Natureza',
      categoryIcon: '🌿',
      title: "Converse com suas plantas por 3 minutos",
      description: "Olhe as folhas novas de um vaso na janela ou no quintal. Retire com carinho as folhas secas.",
      practicalTip: "Passe a mão de leve nas folhas e sinta a textura.",
    },
    {
      id: "disc_gardening_water",
      category: 'GARDENING',
      categoryLabel: 'Jardinagem & Natureza',
      categoryIcon: '🌿',
      title: "Regue com atenção",
      description: "Regue uma planta devagar. Veja a água descendo e a terra escurecendo.",
      practicalTip: "Antes de regar, toque a terra com o dedo: se estiver úmida, a planta pode esperar.",
    },
    {
      id: "disc_gardening_herbs",
      category: 'GARDENING',
      categoryLabel: 'Jardinagem & Natureza',
      categoryIcon: '🌿',
      title: "Plante um tempero na janela",
      description: "Coloque terra num vasinho e plante uma muda de hortelã, salsinha ou manjericão. Deixe num lugar com sol.",
      practicalTip: "Hortelã cresce fácil e pega bem em vaso.",
    },
    {
      id: "disc_gardening_sprout",
      category: 'GARDENING',
      categoryLabel: 'Jardinagem & Natureza',
      categoryIcon: '🌿',
      title: "Brote uma sementinha",
      description: "Coloque um feijão sobre um algodão úmido, num copo, perto da luz. Confira a cada dia se algo mudou.",
      practicalTip: "Em poucos dias aparece uma raiz. Vale anotar a data.",
    },
    {
      id: "disc_gardening_leaf",
      category: 'GARDENING',
      categoryLabel: 'Jardinagem & Natureza',
      categoryIcon: '🌿',
      title: "Colecione folhas diferentes",
      description: "Passeie pela casa ou pela rua e escolha 3 folhas de formatos diferentes. Compare cores e bordas.",
      practicalTip: "Dá para guardar as folhas dentro de um livro.",
    },
    {
      id: "disc_recipe_tea",
      category: 'RECIPE',
      categoryLabel: 'Culinária & Sabor',
      categoryIcon: '🍳',
      title: "Prepare uma infusão aromática com ervas",
      description: "Ferva a água e coloque camomila, erva-doce ou hortelã fresca numa xícara. Tampe por uns 5 minutos e sinta o aroma.",
      practicalTip: "Sinta o cheiro antes do primeiro gole.",
    },
    {
      id: "disc_recipe_fruit_salad",
      category: 'RECIPE',
      categoryLabel: 'Culinária & Sabor',
      categoryIcon: '🍳',
      title: "Monte uma salada de frutas colorida",
      description: "Corte banana, laranja, mamão e maçã em pedaços pequenos. Misture e, se quiser, esprema um pouco de laranja por cima.",
      practicalTip: "Quanto mais cores, mais bonito fica o prato.",
    },
    {
      id: "disc_recipe_cuscuz",
      category: 'RECIPE',
      categoryLabel: 'Culinária & Sabor',
      categoryIcon: '🍳',
      title: "Cuscuz de legumes simples",
      description: "Cozinhe o cuscuz no vapor. Refogue cenoura e tomate picados com um fio de azeite, misture tudo e finalize com cheiro-verde.",
      practicalTip: "Experimente com o legume que você já tem em casa.",
    },
    {
      id: "disc_recipe_banana",
      category: 'RECIPE',
      categoryLabel: 'Culinária & Sabor',
      categoryIcon: '🍳',
      title: "Banana assada com canela",
      description: "Corte uma banana ao meio, polvilhe canela e asse por uns 10 minutos, ou doure numa frigideira antiaderente.",
      practicalTip: "Sirva morna. Fica gostosa sem açúcar.",
    },
    {
      id: "disc_recipe_caldo",
      category: 'RECIPE',
      categoryLabel: 'Culinária & Sabor',
      categoryIcon: '🍳',
      title: "Caldo de abóbora cremoso",
      description: "Cozinhe abóbora em cubos com cebola e água até amolecer. Amasse ou bata no liquidificador, tempere e sirva quentinho.",
      practicalTip: "Combina com um pouco de gengibre ralado.",
    },
    {
      id: "disc_new_word_serendipity",
      category: 'NEW_WORD',
      categoryLabel: 'Palavra Nova',
      categoryIcon: '📝',
      title: "Descubra a palavra: \"Serenidade\"",
      description: "Vem do latim serenitas: o estado de quem está tranquilo, claro, sem perturbações.",
      practicalTip: "Respire fundo três vezes e diga para si: \"Hoje escolho a serenidade\".",
    },
    {
      id: "disc_word_saudade",
      category: 'NEW_WORD',
      categoryLabel: 'Palavra Nova',
      categoryIcon: '📝',
      title: "Descubra a palavra: \"Saudade\"",
      description: "Vem do latim solitas, que lembra solidão. Hoje fala do carinho que sentimos por quem ou o que está longe.",
      practicalTip: "Pense em alguém de quem você sente saudade e mande uma mensagem.",
    },
    {
      id: "disc_word_cafune",
      category: 'NEW_WORD',
      categoryLabel: 'Palavra Nova',
      categoryIcon: '📝',
      title: "Descubra a palavra: \"Cafuné\"",
      description: "Vem do quimbundo (língua africana) kifuné, e quer dizer o carinho feito com os dedos nos cabelos de alguém.",
      practicalTip: "Use a palavra hoje numa conversa.",
    },
    {
      id: "disc_word_jabuticaba",
      category: 'NEW_WORD',
      categoryLabel: 'Palavra Nova',
      categoryIcon: '📝',
      title: "Descubra a palavra: \"Jabuticaba\"",
      description: "Vem do tupi: yabuti, \"tartaruga\", e kaba, \"lugar\", algo como \"lugar de tartarugas\" ou \"fruta que se come em cachos\".",
      practicalTip: "Se puder, prove uma. O sabor é inconfundível.",
    },
    {
      id: "disc_word_acalanto",
      category: 'NEW_WORD',
      categoryLabel: 'Palavra Nova',
      categoryIcon: '📝',
      title: "Descubra a palavra: \"Acalanto\"",
      description: "Vem do verbo acalentar, dar calor e aconchego. É a canção suave para fazer o bebê dormir.",
      practicalTip: "Lembre de uma canção de ninar que você conhece.",
    },
    {
      id: "disc_photo_sky",
      category: 'PHOTOGRAPHY',
      categoryLabel: 'Fotografia & Olhar',
      categoryIcon: '📷',
      title: "Fotografe ou contemple o formato das nuvens",
      description: "Olhe o céu da janela por 2 minutos. Procure formas conhecidas nas nuvens.",
      practicalTip: "Se tiver celular por perto, faça uma foto para guardar.",
    },
    {
      id: "disc_photo_color",
      category: 'PHOTOGRAPHY',
      categoryLabel: 'Fotografia & Olhar',
      categoryIcon: '📷',
      title: "Procure uma cor pela casa",
      description: "Escolha uma cor, como o azul. Encontre 5 coisas dessa cor e olhe cada uma com atenção.",
      practicalTip: "Se quiser, fotografe as cinco juntas.",
    },
    {
      id: "disc_photo_light",
      category: 'PHOTOGRAPHY',
      categoryLabel: 'Fotografia & Olhar',
      categoryIcon: '📷',
      title: "Observe a luz do dia",
      description: "Escolha um cômodo e repare onde a luz do sol bate. Volte a olhar daqui a uma hora e veja o que mudou.",
      practicalTip: "A luz da manhã e a da tarde têm cores diferentes.",
    },
    {
      id: "disc_photo_detail",
      category: 'PHOTOGRAPHY',
      categoryLabel: 'Fotografia & Olhar',
      categoryIcon: '📷',
      title: "Olhe de pertinho",
      description: "Escolha um objeto pequeno, como uma flor, uma xícara ou uma moeda. Olhe de bem perto e repare em um detalhe novo.",
      practicalTip: "Com o celular, dá para fotografar esse detalhe.",
    },
  ];

  /** As 7 áreas de interesse oferecidas como chips de filtro. */
  var CATEGORIES = [
    { category: 'MUSIC', label: 'Música', icon: '🎵' },
    { category: 'READING', label: 'Leitura', icon: '📖' },
    { category: 'DRAWING', label: 'Desenho', icon: '🎨' },
    { category: 'GARDENING', label: 'Jardinagem', icon: '🌿' },
    { category: 'RECIPE', label: 'Culinária', icon: '🍳' },
    { category: 'NEW_WORD', label: 'Palavra Nova', icon: '📝' },
    { category: 'PHOTOGRAPHY', label: 'Fotografia', icon: '📷' },
  ];

  var HISTORY_DAYS = 14;
  var AVOID_DAYS = 7;

  function dayNumber(dateStr) {
    var p = String(dateStr || '').split('-');
    if (p.length !== 3) return NaN;
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }

  /** Mantém só os últimos 14 dias: [{ id, date, completed? }]. */
  function pruneHistory(history, today) {
    var t = dayNumber(today);
    return (Array.isArray(history) ? history : []).filter(function (e) {
      if (!e || typeof e.id !== 'string') return false;
      var diff = t - dayNumber(e.date);
      return isFinite(diff) && diff >= 0 && diff < HISTORY_DAYS;
    });
  }

  /** Registra uma exibição (ou conclusão). Devolve novo histórico (não muta). */
  function recordInHistory(history, id, today, completed) {
    var list = pruneHistory(history, today).filter(function (e) {
      return !(e.id === id && e.date === today);
    });
    var entry = { id: id, date: today };
    if (completed) entry.completed = true;
    else if ((history || []).some(function (e) { return e && e.id === id && e.date === today && e.completed; })) entry.completed = true;
    list.push(entry);
    return list;
  }

  function lastSeenMap(history, today) {
    var map = {};
    var t = dayNumber(today);
    pruneHistory(history, today).forEach(function (e) {
      var age = t - dayNumber(e.date);
      if (map[e.id] === undefined || age < map[e.id]) map[e.id] = age;
    });
    return map; // id -> idade em dias da última exibição
  }

  /**
   * Sorteio com anti-repetição.
   *  1) Exclui itens vistos/concluídos nos últimos 7 dias e os `excludedIds`.
   *  2) Se o pool esgotar, escolhe o visto há MAIS tempo (empate: sorteio).
   *  3) Se só restar o próprio item atual, ele é devolvido (nunca fica sem resultado).
   * @param {string[]} excludedIds  ex.: o item atual
   * @param {string}   selectedCategory 'ALL' ou categoria
   * @param {Array}    history  histórico persistido
   * @param {string}   today    'YYYY-MM-DD' (data local)
   * @param {function} [rng]    () => [0,1) — injetável para testes
   */
  function rollSurprise(excludedIds, selectedCategory, history, today, rng) {
    var excluded = excludedIds || [];
    var category = selectedCategory || 'ALL';
    var rand = typeof rng === 'function' ? rng : Math.random;

    var pool = DISCOVERY_CATALOG;
    if (category !== 'ALL') {
      pool = pool.filter(function (item) {
        return item.category === category;
      });
    }
    var seen = today ? lastSeenMap(history, today) : {};

    var candidates = pool.filter(function (i) { return excluded.indexOf(i.id) < 0; });
    if (candidates.length === 0) candidates = pool;

    var fresh = candidates.filter(function (i) {
      return seen[i.id] === undefined || seen[i.id] >= AVOID_DAYS;
    });
    var finalPool = fresh;
    if (fresh.length === 0) {
      var maxAge = -1;
      candidates.forEach(function (i) {
        if (seen[i.id] > maxAge) maxAge = seen[i.id];
      });
      finalPool = candidates.filter(function (i) { return seen[i.id] === maxAge; });
    }
    return finalPool[Math.min(finalPool.length - 1, Math.floor(rand() * finalPool.length))];
  }

  function getCategories() {
    return CATEGORIES;
  }

  EM.domain = EM.domain || {};
  EM.domain.discoveryEngine = {
    DISCOVERY_CATALOG: DISCOVERY_CATALOG,
    rollSurprise: rollSurprise,
    pruneHistory: pruneHistory,
    recordInHistory: recordInHistory,
    HISTORY_DAYS: HISTORY_DAYS,
    AVOID_DAYS: AVOID_DAYS,
    getCategories: getCategories,
  };
})(window);
