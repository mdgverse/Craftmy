import type { AccessoryId, ClothingSlot, ClothingState, FabricType } from '../types/studio';

export interface ClothingCatalogItem {
  id: string;
  slot: ClothingSlot;
  name: string;
  fitLabel: 'Justo' | 'Regular' | 'Solto' | 'Oversized' | 'Estruturado';
  defaultColor: string;
  defaultSecondary: string;
  defaultFabric: FabricType;
  /** If true, fullBody item can be worn together with innerTop (e.g. overalls) */
  keepsInnerTop?: boolean;
}

export interface AccessoryCatalogItem {
  id: AccessoryId;
  name: string;
  category: string;
  defaultColor: string;
  defaultSecondary: string;
  defaultFabric: FabricType;
}

export const FABRIC_PRESETS: Record<
  FabricType,
  { label: string; roughness: number; metalness: number; sheen: number }
> = {
  cotton: { label: 'Algodão', roughness: 0.82, metalness: 0.0, sheen: 0.25 },
  denim: { label: 'Jeans', roughness: 0.88, metalness: 0.02, sheen: 0.18 },
  leather: { label: 'Couro', roughness: 0.34, metalness: 0.08, sheen: 0.35 },
  silk: { label: 'Seda / Cetim', roughness: 0.26, metalness: 0.05, sheen: 0.7 },
  wool: { label: 'Lã / Tricô', roughness: 0.94, metalness: 0.0, sheen: 0.4 },
  synthetic: { label: 'Sintético', roughness: 0.48, metalness: 0.04, sheen: 0.3 },
};

export const CLOTHING_SLOT_LABELS: { id: ClothingSlot; label: string; subtitle: string }[] = [
  { id: 'innerTop', label: 'Superior Base', subtitle: 'Camisetas, regatas, blusas e camisas' },
  { id: 'outerTop', label: 'Sobreposição', subtitle: 'Camisas abertas, moletons, jaquetas e casacos' },
  { id: 'bottom', label: 'Parte Inferior', subtitle: 'Calças, shorts, bermudas, leggings e saias' },
  { id: 'fullBody', label: 'Vestidos & Únicas', subtitle: 'Vestidos, macacões e jardineiras' },
  { id: 'footwear', label: 'Calçados', subtitle: 'Tênis, sapatos sociais e botas' },
];

export const CLOTHING_CATALOG: ClothingCatalogItem[] = [
  // ---- INNER TOPS ----
  {
    id: 'tshirt_basic',
    slot: 'innerTop',
    name: 'Camiseta Básica',
    fitLabel: 'Regular',
    defaultColor: '#e5e7eb',
    defaultSecondary: '#d1d5db',
    defaultFabric: 'cotton',
  },
  {
    id: 'tshirt_oversized',
    slot: 'innerTop',
    name: 'Camiseta Oversized',
    fitLabel: 'Oversized',
    defaultColor: '#272932',
    defaultSecondary: '#3b3f4c',
    defaultFabric: 'cotton',
  },
  {
    id: 'tank_top',
    slot: 'innerTop',
    name: 'Regata Canelada',
    fitLabel: 'Justo',
    defaultColor: '#f3f4f6',
    defaultSecondary: '#e5e7eb',
    defaultFabric: 'cotton',
  },
  {
    id: 'crop_top',
    slot: 'innerTop',
    name: 'Crop Top',
    fitLabel: 'Justo',
    defaultColor: '#b94a48',
    defaultSecondary: '#8f3533',
    defaultFabric: 'cotton',
  },
  {
    id: 'cropped_long',
    slot: 'innerTop',
    name: 'Cropped Manga Longa',
    fitLabel: 'Justo',
    defaultColor: '#23262f',
    defaultSecondary: '#3c4252',
    defaultFabric: 'synthetic',
  },
  {
    id: 'blouse_short',
    slot: 'innerTop',
    name: 'Blusa Manga Curta',
    fitLabel: 'Solto',
    defaultColor: '#d9b99b',
    defaultSecondary: '#c19d7c',
    defaultFabric: 'silk',
  },
  {
    id: 'blouse_long',
    slot: 'innerTop',
    name: 'Blusa Gola Alta Manga Longa',
    fitLabel: 'Justo',
    defaultColor: '#1f2937',
    defaultSecondary: '#374151',
    defaultFabric: 'wool',
  },
  {
    id: 'dress_shirt',
    slot: 'innerTop',
    name: 'Camisa Social',
    fitLabel: 'Estruturado',
    defaultColor: '#eef2f7',
    defaultSecondary: '#94a3b8',
    defaultFabric: 'cotton',
  },
  {
    id: 'sweater_knit',
    slot: 'innerTop',
    name: 'Suéter de Tricô',
    fitLabel: 'Solto',
    defaultColor: '#7c5338',
    defaultSecondary: '#5e3d28',
    defaultFabric: 'wool',
  },

  // ---- OUTER TOPS (Layerable over innerTop & fullBody!) ----
  {
    id: 'open_shirt',
    slot: 'outerTop',
    name: 'Camisa Aberta Sobreposta',
    fitLabel: 'Solto',
    defaultColor: '#3b5b7c',
    defaultSecondary: '#2a425b',
    defaultFabric: 'cotton',
  },
  {
    id: 'hoodie_pullover',
    slot: 'outerTop',
    name: 'Moletom com Capuz',
    fitLabel: 'Oversized',
    defaultColor: '#4b5563',
    defaultSecondary: '#374151',
    defaultFabric: 'cotton',
  },
  {
    id: 'hoodie_zip_open',
    slot: 'outerTop',
    name: 'Moletom Aberto (Zíper)',
    fitLabel: 'Oversized',
    defaultColor: '#374151',
    defaultSecondary: '#9ca3af',
    defaultFabric: 'cotton',
  },
  {
    id: 'jacket_leather',
    slot: 'outerTop',
    name: 'Jaqueta Bomber / Couro',
    fitLabel: 'Estruturado',
    defaultColor: '#1b1c20',
    defaultSecondary: '#71717a',
    defaultFabric: 'leather',
  },
  {
    id: 'jacket_cropped',
    slot: 'outerTop',
    name: 'Jaqueta Jeans Cropped',
    fitLabel: 'Estruturado',
    defaultColor: '#4a6b8a',
    defaultSecondary: '#c29b61',
    defaultFabric: 'denim',
  },
  {
    id: 'coat_trench',
    slot: 'outerTop',
    name: 'Casaco Longo / Sobretudo',
    fitLabel: 'Solto',
    defaultColor: '#8c6d53',
    defaultSecondary: '#5c4634',
    defaultFabric: 'wool',
  },
  {
    id: 'vest_layered',
    slot: 'outerTop',
    name: 'Colete de Sobreposição',
    fitLabel: 'Regular',
    defaultColor: '#2f3e34',
    defaultSecondary: '#1f2a23',
    defaultFabric: 'synthetic',
  },

  // ---- BOTTOMS ----
  {
    id: 'shorts_short',
    slot: 'bottom',
    name: 'Shorts Curto',
    fitLabel: 'Regular',
    defaultColor: '#4b6c8c',
    defaultSecondary: '#365069',
    defaultFabric: 'denim',
  },
  {
    id: 'bermuda',
    slot: 'bottom',
    name: 'Bermuda Casual',
    fitLabel: 'Solto',
    defaultColor: '#a69279',
    defaultSecondary: '#85735d',
    defaultFabric: 'cotton',
  },
  {
    id: 'jeans_regular',
    slot: 'bottom',
    name: 'Calça Jeans',
    fitLabel: 'Regular',
    defaultColor: '#355070',
    defaultSecondary: '#c59b5f',
    defaultFabric: 'denim',
  },
  {
    id: 'pants_dress',
    slot: 'bottom',
    name: 'Calça Social Alfaiataria',
    fitLabel: 'Estruturado',
    defaultColor: '#252830',
    defaultSecondary: '#181a20',
    defaultFabric: 'wool',
  },
  {
    id: 'pants_wide',
    slot: 'bottom',
    name: 'Calça Larga (Wide Leg)',
    fitLabel: 'Oversized',
    defaultColor: '#3d405b',
    defaultSecondary: '#2b2d42',
    defaultFabric: 'denim',
  },
  {
    id: 'pants_cargo',
    slot: 'bottom',
    name: 'Calça Cargo (com Bolsos)',
    fitLabel: 'Solto',
    defaultColor: '#4f5d48',
    defaultSecondary: '#3a4535',
    defaultFabric: 'cotton',
  },
  {
    id: 'leggings',
    slot: 'bottom',
    name: 'Legging Ajustada',
    fitLabel: 'Justo',
    defaultColor: '#1e2028',
    defaultSecondary: '#2e313d',
    defaultFabric: 'synthetic',
  },
  {
    id: 'skirt_short',
    slot: 'bottom',
    name: 'Saia Curta Plissada',
    fitLabel: 'Solto',
    defaultColor: '#2c3345',
    defaultSecondary: '#1f2433',
    defaultFabric: 'wool',
  },
  {
    id: 'skirt_midi',
    slot: 'bottom',
    name: 'Saia Média Evasê',
    fitLabel: 'Solto',
    defaultColor: '#8d5b4c',
    defaultSecondary: '#6e4539',
    defaultFabric: 'silk',
  },
  {
    id: 'skirt_long',
    slot: 'bottom',
    name: 'Saia Longa Fluida',
    fitLabel: 'Solto',
    defaultColor: '#5c4d68',
    defaultSecondary: '#43374d',
    defaultFabric: 'silk',
  },

  // ---- FULL BODY (Dresses, Jumpsuit, Overalls) ----
  {
    id: 'dress_short',
    slot: 'fullBody',
    name: 'Vestido Curto Rodado',
    fitLabel: 'Regular',
    defaultColor: '#9e3b4b',
    defaultSecondary: '#7a2b38',
    defaultFabric: 'cotton',
  },
  {
    id: 'dress_midi',
    slot: 'fullBody',
    name: 'Vestido Médio Evasê',
    fitLabel: 'Solto',
    defaultColor: '#3d6b66',
    defaultSecondary: '#2b4f4b',
    defaultFabric: 'silk',
  },
  {
    id: 'dress_long',
    slot: 'fullBody',
    name: 'Vestido Longo Fluido',
    fitLabel: 'Solto',
    defaultColor: '#2b3a67',
    defaultSecondary: '#1d2849',
    defaultFabric: 'silk',
  },
  {
    id: 'dress_tight',
    slot: 'fullBody',
    name: 'Vestido Justo (Tubinho)',
    fitLabel: 'Justo',
    defaultColor: '#1f1f26',
    defaultSecondary: '#363642',
    defaultFabric: 'silk',
  },
  {
    id: 'dress_loose',
    slot: 'fullBody',
    name: 'Vestido Largo (Bata/A-Line)',
    fitLabel: 'Oversized',
    defaultColor: '#d4a373',
    defaultSecondary: '#b58456',
    defaultFabric: 'cotton',
  },
  {
    id: 'dress_open_back',
    slot: 'fullBody',
    name: 'Vestido com Costas Abertas',
    fitLabel: 'Justo',
    defaultColor: '#7f1d2d',
    defaultSecondary: '#c9a25e',
    defaultFabric: 'silk',
  },
  {
    id: 'jumpsuit',
    slot: 'fullBody',
    name: 'Macacão Utilitário',
    fitLabel: 'Regular',
    defaultColor: '#485652',
    defaultSecondary: '#323d3a',
    defaultFabric: 'cotton',
  },
  {
    id: 'overalls',
    slot: 'fullBody',
    name: 'Jardineira Jeans',
    fitLabel: 'Solto',
    defaultColor: '#3f5e80',
    defaultSecondary: '#d4a853',
    defaultFabric: 'denim',
    keepsInnerTop: true,
  },

  // ---- FOOTWEAR ----
  {
    id: 'sneakers',
    slot: 'footwear',
    name: 'Tênis Casual',
    fitLabel: 'Regular',
    defaultColor: '#e5e7eb',
    defaultSecondary: '#374151',
    defaultFabric: 'synthetic',
  },
  {
    id: 'boots_combat',
    slot: 'footwear',
    name: 'Bota / Coturno',
    fitLabel: 'Estruturado',
    defaultColor: '#1c1917',
    defaultSecondary: '#44403c',
    defaultFabric: 'leather',
  },
  {
    id: 'shoes_dress',
    slot: 'footwear',
    name: 'Sapato Social',
    fitLabel: 'Estruturado',
    defaultColor: '#3b2618',
    defaultSecondary: '#1c120b',
    defaultFabric: 'leather',
  },
];

export const ACCESSORY_CATALOG: AccessoryCatalogItem[] = [
  {
    id: 'belt',
    name: 'Cinto com Fivela',
    category: 'Cintura',
    defaultColor: '#2c1e14',
    defaultSecondary: '#d4af37',
    defaultFabric: 'leather',
  },
  {
    id: 'tie',
    name: 'Gravata Clássica',
    category: 'Pescoço',
    defaultColor: '#7f1d1d',
    defaultSecondary: '#450a0a',
    defaultFabric: 'silk',
  },
  {
    id: 'bowtie',
    name: 'Gravata Borboleta',
    category: 'Pescoço',
    defaultColor: '#18181b',
    defaultSecondary: '#3f3f46',
    defaultFabric: 'silk',
  },
  {
    id: 'suspenders',
    name: 'Suspensórios',
    category: 'Tronco',
    defaultColor: '#4a3222',
    defaultSecondary: '#c8a951',
    defaultFabric: 'leather',
  },
  {
    id: 'socksShort',
    name: 'Meias Cano Médio',
    category: 'Pernas',
    defaultColor: '#f3f4f6',
    defaultSecondary: '#d1d5db',
    defaultFabric: 'cotton',
  },
  {
    id: 'socksLong',
    name: 'Meias Longas (3/4)',
    category: 'Pernas',
    defaultColor: '#27272a',
    defaultSecondary: '#e5e7eb',
    defaultFabric: 'cotton',
  },
  {
    id: 'gloves',
    name: 'Luvas Completas',
    category: 'Mãos',
    defaultColor: '#1f1f24',
    defaultSecondary: '#3f3f46',
    defaultFabric: 'leather',
  },
  {
    id: 'glovesFingerless',
    name: 'Luvas Táticas (Sem Dedos)',
    category: 'Mãos',
    defaultColor: '#27272a',
    defaultSecondary: '#52525b',
    defaultFabric: 'leather',
  },
  {
    id: 'scarf',
    name: 'Cachecol Volumoso',
    category: 'Pescoço',
    defaultColor: '#9a3412',
    defaultSecondary: '#7c2d12',
    defaultFabric: 'wool',
  },
  {
    id: 'choker',
    name: 'Gargantilha / Choker',
    category: 'Pescoço',
    defaultColor: '#18181b',
    defaultSecondary: '#d4d4d8',
    defaultFabric: 'leather',
  },
  {
    id: 'watch',
    name: 'Relógio / Bracelete',
    category: 'Pulso',
    defaultColor: '#27272a',
    defaultSecondary: '#d4af37',
    defaultFabric: 'leather',
  },
];

export function createEmptyClothing(): ClothingState {
  const accessories = {} as ClothingState['accessories'];
  for (const item of ACCESSORY_CATALOG) {
    accessories[item.id] = {
      enabled: false,
      color: item.defaultColor,
      secondaryColor: item.defaultSecondary,
      fabric: item.defaultFabric,
    };
  }
  return {
    innerTop: {
      itemId: null,
      color: '#e5e7eb',
      secondaryColor: '#cbd5e1',
      fabric: 'cotton',
      ease: 0,
    },
    outerTop: {
      itemId: null,
      color: '#3b5b7c',
      secondaryColor: '#2a425b',
      fabric: 'cotton',
      ease: 0,
    },
    bottom: {
      itemId: null,
      color: '#355070',
      secondaryColor: '#c59b5f',
      fabric: 'denim',
      ease: 0,
    },
    fullBody: {
      itemId: null,
      color: '#9e3b4b',
      secondaryColor: '#7a2b38',
      fabric: 'silk',
      ease: 0,
    },
    footwear: {
      itemId: null,
      color: '#e5e7eb',
      secondaryColor: '#374151',
      fabric: 'synthetic',
      ease: 0,
    },
    accessories,
  };
}

export interface OutfitPreset {
  id: string;
  name: string;
  apply: (base: ClothingState) => ClothingState;
}

export const OUTFIT_PRESETS: OutfitPreset[] = [
  {
    id: 'anatomy_nude',
    name: 'Manequim Puro (Sem Roupa)',
    apply: () => createEmptyClothing(),
  },
  {
    id: 'street_layered',
    name: 'Urbano Sobreposto',
    apply: () => {
      const c = createEmptyClothing();
      c.innerTop = { itemId: 'tshirt_basic', color: '#f3f4f6', secondaryColor: '#d1d5db', fabric: 'cotton', ease: 0.05 };
      c.outerTop = { itemId: 'open_shirt', color: '#3b5b7c', secondaryColor: '#23384e', fabric: 'cotton', ease: 0.15 };
      c.bottom = { itemId: 'pants_cargo', color: '#4a5543', secondaryColor: '#353e30', fabric: 'cotton', ease: 0.1 };
      c.footwear = { itemId: 'sneakers', color: '#f3f4f6', secondaryColor: '#1f2937', fabric: 'synthetic', ease: 0 };
      c.accessories.belt.enabled = true;
      c.accessories.watch.enabled = true;
      return c;
    },
  },
  {
    id: 'biker_jacket',
    name: 'Jaqueta + Regata',
    apply: () => {
      const c = createEmptyClothing();
      c.innerTop = { itemId: 'tank_top', color: '#e5e7eb', secondaryColor: '#cbd5e1', fabric: 'cotton', ease: 0 };
      c.outerTop = { itemId: 'jacket_leather', color: '#1b1c20', secondaryColor: '#a1a1aa', fabric: 'leather', ease: 0.1 };
      c.bottom = { itemId: 'jeans_regular', color: '#2b4162', secondaryColor: '#c59b5f', fabric: 'denim', ease: 0 };
      c.footwear = { itemId: 'boots_combat', color: '#18181b', secondaryColor: '#3f3f46', fabric: 'leather', ease: 0 };
      c.accessories.glovesFingerless.enabled = true;
      c.accessories.belt.enabled = true;
      return c;
    },
  },
  {
    id: 'formal_suspenders',
    name: 'Social Clássico',
    apply: () => {
      const c = createEmptyClothing();
      c.innerTop = { itemId: 'dress_shirt', color: '#f1f5f9', secondaryColor: '#94a3b8', fabric: 'cotton', ease: 0 };
      c.bottom = { itemId: 'pants_dress', color: '#23262f', secondaryColor: '#171920', fabric: 'wool', ease: 0 };
      c.footwear = { itemId: 'shoes_dress', color: '#3b2416', secondaryColor: '#1a0f09', fabric: 'leather', ease: 0 };
      c.accessories.tie.enabled = true;
      c.accessories.suspenders.enabled = true;
      c.accessories.belt.enabled = true;
      return c;
    },
  },
  {
    id: 'trench_noir',
    name: 'Sobretudo Detetive',
    apply: () => {
      const c = createEmptyClothing();
      c.innerTop = { itemId: 'blouse_long', color: '#1c1f26', secondaryColor: '#2d323d', fabric: 'wool', ease: 0 };
      c.outerTop = { itemId: 'coat_trench', color: '#8f6f52', secondaryColor: '#5c4632', fabric: 'wool', ease: 0.15 };
      c.bottom = { itemId: 'pants_wide', color: '#272a33', secondaryColor: '#1b1d24', fabric: 'wool', ease: 0.1 };
      c.footwear = { itemId: 'boots_combat', color: '#261c16', secondaryColor: '#3f3026', fabric: 'leather', ease: 0 };
      c.accessories.gloves.enabled = true;
      return c;
    },
  },
  {
    id: 'evening_open_back',
    name: 'Gala Costas Abertas',
    apply: () => {
      const c = createEmptyClothing();
      c.fullBody = { itemId: 'dress_open_back', color: '#7f1d2d', secondaryColor: '#d4af37', fabric: 'silk', ease: 0 };
      c.footwear = { itemId: 'shoes_dress', color: '#1c1917', secondaryColor: '#d4af37', fabric: 'leather', ease: 0 };
      c.accessories.choker.enabled = true;
      return c;
    },
  },
  {
    id: 'overalls_tee',
    name: 'Jardineira + Camiseta',
    apply: () => {
      const c = createEmptyClothing();
      c.innerTop = { itemId: 'tshirt_basic', color: '#f59e0b', secondaryColor: '#d97706', fabric: 'cotton', ease: 0 };
      c.fullBody = { itemId: 'overalls', color: '#3b5d82', secondaryColor: '#d4a853', fabric: 'denim', ease: 0.08 };
      c.footwear = { itemId: 'sneakers', color: '#f3f4f6', secondaryColor: '#b91c1c', fabric: 'synthetic', ease: 0 };
      c.accessories.socksShort.enabled = true;
      return c;
    },
  },
  {
    id: 'crop_skirt',
    name: 'Cropped + Saia + Meia 3/4',
    apply: () => {
      const c = createEmptyClothing();
      c.innerTop = { itemId: 'crop_top', color: '#f3f4f6', secondaryColor: '#d1d5db', fabric: 'cotton', ease: 0 };
      c.outerTop = { itemId: 'jacket_cropped', color: '#476a8a', secondaryColor: '#c59b5f', fabric: 'denim', ease: 0.1 };
      c.bottom = { itemId: 'skirt_short', color: '#272c3d', secondaryColor: '#1a1e2b', fabric: 'wool', ease: 0.05 };
      c.footwear = { itemId: 'boots_combat', color: '#18181b', secondaryColor: '#3f3f46', fabric: 'leather', ease: 0 };
      c.accessories.socksLong.enabled = true;
      c.accessories.choker.enabled = true;
      return c;
    },
  },
];
