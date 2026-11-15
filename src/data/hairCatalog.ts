export type HairCategory =
  | 'all'
  | 'short'
  | 'straight'
  | 'wavy'
  | 'curly'
  | 'coily'
  | 'braids'
  | 'updo';

export interface HairCatalogItem {
  id: string;
  name: string;
  categories: HairCategory[];
  textureLabel: string;
  silhouetteNote: string;
  hasSecondaryColor?: boolean;
}

export const HAIR_CATEGORY_LABELS: { id: HairCategory; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'short', label: 'Curtos & Cortes' },
  { id: 'straight', label: 'Lisos' },
  { id: 'wavy', label: 'Ondulados' },
  { id: 'curly', label: 'Cacheados' },
  { id: 'coily', label: 'Crespos & Afro' },
  { id: 'braids', label: 'Tranças, Twists & Locs' },
  { id: 'updo', label: 'Presos & Penteados' },
];

export const HAIR_CATALOG: HairCatalogItem[] = [
  {
    id: 'bald',
    name: 'Sem Cabelo (Careca)',
    categories: ['short'],
    textureLabel: 'Anatômico',
    silhouetteNote: 'Crânio livre para estudo puro',
  },
  {
    id: 'buzz_cut',
    name: 'Buzz Cut (Raspado)',
    categories: ['short'],
    textureLabel: 'Raspado #1',
    silhouetteNote: 'Rente ao crânio com linha frontal marcada',
  },
  {
    id: 'low_fade',
    name: 'Degradê Baixo (Crop)',
    categories: ['short', 'straight', 'wavy'],
    textureLabel: 'Degradê + Textura',
    silhouetteNote: 'Laterais em fade suave e topo texturizado curto',
  },
  {
    id: 'high_top_fade',
    name: 'High Top Degradê',
    categories: ['short', 'coily'],
    textureLabel: 'Crespo 4C Fade',
    silhouetteNote: 'Topo alto estruturado com laterais raspadas',
  },
  {
    id: 'undercut_swept',
    name: 'Undercut Volumoso',
    categories: ['short', 'straight', 'wavy'],
    textureLabel: 'Liso/Ondulado',
    silhouetteNote: 'Laterais baixas e mechas jogadas para trás',
    hasSecondaryColor: true,
  },
  {
    id: 'classic_part',
    name: 'Social Clássico',
    categories: ['short', 'straight'],
    textureLabel: 'Liso 1B',
    silhouetteNote: 'Risca lateral definida e nuca alinhada',
  },
  {
    id: 'modern_mullet',
    name: 'Mullet Repicado',
    categories: ['short', 'wavy'],
    textureLabel: 'Ondulado 2B',
    silhouetteNote: 'Franja desconectada, laterais curtas e nuca alongada',
    hasSecondaryColor: true,
  },
  {
    id: 'pixie_layered',
    name: 'Pixie Assimétrico',
    categories: ['short', 'straight'],
    textureLabel: 'Liso 1C',
    silhouetteNote: 'Camadas curtas com franja diagonal leve',
  },
  {
    id: 'bob_bangs',
    name: 'Chanel / Bob com Franja',
    categories: ['straight'],
    textureLabel: 'Liso 1A',
    silhouetteNote: 'Corte reto na mandíbula com franja cheia',
    hasSecondaryColor: true,
  },
  {
    id: 'straight_layered_mid',
    name: 'Liso Médio em Camadas',
    categories: ['straight'],
    textureLabel: 'Liso 1B',
    silhouetteNote: 'Repicado na altura dos ombros com movimento',
    hasSecondaryColor: true,
  },
  {
    id: 'straight_long',
    name: 'Liso Longo Solto',
    categories: ['straight'],
    textureLabel: 'Liso 1A',
    silhouetteNote: 'Queda alinhada até o meio das costas, repartido ao meio',
    hasSecondaryColor: true,
  },
  {
    id: 'straight_hime_xlong',
    name: 'Extra Longo com Franja Hime',
    categories: ['straight'],
    textureLabel: 'Liso 1A',
    silhouetteNote: 'Comprimento até o quadril com laterais retas no rosto',
    hasSecondaryColor: true,
  },
  {
    id: 'wavy_surfer',
    name: 'Ondulado Curto Despojado',
    categories: ['short', 'wavy'],
    textureLabel: 'Ondulado 2A',
    silhouetteNote: 'Mechas soltas ao redor das orelhas e testa',
  },
  {
    id: 'wavy_shag_wolf',
    name: 'Wolf Cut / Shag em Camadas',
    categories: ['wavy'],
    textureLabel: 'Ondulado 2C',
    silhouetteNote: 'Topo volumoso, curtain bangs e pontas repicadas',
    hasSecondaryColor: true,
  },
  {
    id: 'wavy_long_glam',
    name: 'Ondulado Longo Volumoso',
    categories: ['wavy'],
    textureLabel: 'Ondulado 2B/2C',
    silhouetteNote: 'Ondas largas em S caindo sobre ombros e costas',
    hasSecondaryColor: true,
  },
  {
    id: 'curly_tapered',
    name: 'Cacheado Curto Tapered',
    categories: ['short', 'curly'],
    textureLabel: 'Cacheado 3B/3C',
    silhouetteNote: 'Cachos concentrados no topo e franja, têmporas baixas',
    hasSecondaryColor: true,
  },
  {
    id: 'curly_round_halo',
    name: 'Cacheado Médio Arredondado',
    categories: ['curly'],
    textureLabel: 'Cacheado 3C',
    silhouetteNote: 'Silhueta esférica em camadas com franja cacheada',
    hasSecondaryColor: true,
  },
  {
    id: 'curly_long_cascade',
    name: 'Cacheado Longo em Cascata',
    categories: ['curly'],
    textureLabel: 'Cacheado 3A/3B',
    silhouetteNote: 'Volume piramidal longo com cachos espirais definidos',
    hasSecondaryColor: true,
  },
  {
    id: 'curly_side_volume',
    name: 'Cacheado Lateral Volumoso',
    categories: ['curly'],
    textureLabel: 'Cacheado 3B',
    silhouetteNote: 'Divisão profunda lateral com caimento assimétrico',
    hasSecondaryColor: true,
  },
  {
    id: 'coily_sponge',
    name: 'Crespo Curto Nudred',
    categories: ['short', 'coily'],
    textureLabel: 'Crespo 4C',
    silhouetteNote: 'Minimechas esponjadas densas e bem definidas',
  },
  {
    id: 'afro_classic',
    name: 'Afro Médio Natural',
    categories: ['coily'],
    textureLabel: 'Crespo 4A/4B',
    silhouetteNote: 'Coroa orgânica densa com textura espiral fechada',
  },
  {
    id: 'black_power',
    name: 'Black Power Escultural',
    categories: ['coily'],
    textureLabel: 'Crespo 4C',
    silhouetteNote: 'Grande volume imponente e contorno rico em textura',
    hasSecondaryColor: true,
  },
  {
    id: 'afro_puffs',
    name: 'Afro Puff Duplo',
    categories: ['coily', 'updo'],
    textureLabel: 'Crespo 4B/4C',
    silhouetteNote: 'Divisão central com dois puffs altos volumosos',
    hasSecondaryColor: true,
  },
  {
    id: 'two_strand_twists',
    name: 'Twists Médios Soltos',
    categories: ['braids', 'coily'],
    textureLabel: 'Twists 4B',
    silhouetteNote: 'Cordões torcidos em dupla emoldurando o rosto',
    hasSecondaryColor: true,
  },
  {
    id: 'box_braids_long',
    name: 'Box Braids Longas',
    categories: ['braids'],
    textureLabel: 'Tranças Soltas',
    silhouetteNote: 'Dezenas de tranças longas com divisões no couro',
    hasSecondaryColor: true,
  },
  {
    id: 'cornrows_nago',
    name: 'Trança Nagô (Cornrows)',
    categories: ['braids', 'short'],
    textureLabel: 'Trança Raiz',
    silhouetteNote: 'Fileiras paralelas rentes ao couro até a nuca',
    hasSecondaryColor: true,
  },
  {
    id: 'dreadlocks_mid',
    name: 'Dreadlocks Médios',
    categories: ['braids', 'coily'],
    textureLabel: 'Locs Orgânicos',
    silhouetteNote: 'Locs espessos com caimento natural e anéis',
    hasSecondaryColor: true,
  },
  {
    id: 'dreadlocks_high_tie',
    name: 'Dreadlocks Presos no Topo',
    categories: ['braids', 'updo'],
    textureLabel: 'Locs + Undercut',
    silhouetteNote: 'Feixe alto amarrado com cascata de locs e fade',
    hasSecondaryColor: true,
  },
  {
    id: 'high_ponytail',
    name: 'Rabo de Cavalo Alto',
    categories: ['updo', 'straight', 'wavy'],
    textureLabel: 'Preso Dinâmico',
    silhouetteNote: 'Topo alinhado e cauda longa arqueada com mechas frontais',
    hasSecondaryColor: true,
  },
  {
    id: 'messy_high_bun',
    name: 'Coque Alto Despojado',
    categories: ['updo'],
    textureLabel: 'Coque Volumoso',
    silhouetteNote: 'Coque torcido no topo com mechas soltas nas têmporas',
    hasSecondaryColor: true,
  },
  {
    id: 'half_up_wavy',
    name: 'Semi-Preso Ondulado',
    categories: ['updo', 'wavy'],
    textureLabel: 'Semi-Preso 2B',
    silhouetteNote: 'Meio coque superior com comprimento ondulado solto',
    hasSecondaryColor: true,
  },
  {
    id: 'twin_tails',
    name: 'Maria-Chiquinha Longa',
    categories: ['updo', 'straight'],
    textureLabel: 'Duplo Longo',
    silhouetteNote: 'Duas caudas laterais fluidas com franja repicada',
    hasSecondaryColor: true,
  },
];
