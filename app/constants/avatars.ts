// Selected best Dicebear styles for cool avatars
const AVATAR_STYLES = [
  'adventurer', // Fantasy adventurer style - very detailed and cool
  'lorelei', // Anime-style avatars - modern and stylish
  'notionists', // Professional, minimalist style - clean and elegant
  'bottts', // Cute robot avatars with personality
] as const;

// Beautiful background configuration for avatars
const AVATAR_BACKGROUND = {
  type: 'solid' as const,
  color: '0f172a', // Dark slate background
} as const;

// Define types for style options
type StyleOption = {
  readonly style?: readonly ['shape'];
  readonly shapeColor?: readonly string[];
  readonly hairColor?: readonly string[];
  readonly accessoriesProbability?: number;
  readonly glassesProbability?: number;
  readonly hairAccessoriesProbability?: number;
  readonly colorful?: boolean;
  readonly primaryColorLevel?: number;
  readonly secondaryColorLevel?: number;
  readonly texture?: readonly ['circuits', 'dots'];
};

// Style-specific options for better looking avatars
const styleOptions: Record<(typeof AVATAR_STYLES)[number], StyleOption> = {
  adventurer: {
    hairColor: ['0e7490', '0369a1', '1e40af', 'c026d3'] as const,
    accessoriesProbability: 90,
    glassesProbability: 30,
  },
  lorelei: {
    hairAccessoriesProbability: 50,
  },
  notionists: {
    style: ['shape'] as const,
    shapeColor: ['f472b6', '6366f1', 'a855f7', 'c026d3'] as const,
  },
  bottts: {
    colorful: true,
    primaryColorLevel: 600,
    secondaryColorLevel: 400,
    texture: ['circuits', 'dots'] as const,
  },
} as const;

// Helper function to create avatar URL parameters
function createAvatarParams(seed: string, options: StyleOption): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor: AVATAR_BACKGROUND.color,
  });

  // Add style-specific options with proper type checking
  if (options.style) params.append('style', options.style[0]);
  if (options.shapeColor) {
    const randomColor =
      options.shapeColor[Math.floor(Math.random() * options.shapeColor.length)];
    params.append('shapeColor', randomColor);
  }
  if (options.hairColor) {
    const randomColor =
      options.hairColor[Math.floor(Math.random() * options.hairColor.length)];
    params.append('hairColor', randomColor);
  }
  if (options.accessoriesProbability)
    params.append(
      'accessoriesProbability',
      options.accessoriesProbability.toString()
    );
  if (options.glassesProbability)
    params.append('glassesProbability', options.glassesProbability.toString());
  if (options.hairAccessoriesProbability)
    params.append(
      'hairAccessoriesProbability',
      options.hairAccessoriesProbability.toString()
    );
  if (options.colorful) params.append('colorful', options.colorful.toString());
  if (options.primaryColorLevel)
    params.append('primaryColorLevel', options.primaryColorLevel.toString());
  if (options.secondaryColorLevel)
    params.append(
      'secondaryColorLevel',
      options.secondaryColorLevel.toString()
    );
  if (options.texture) {
    const randomTexture =
      options.texture[Math.floor(Math.random() * options.texture.length)];
    params.append('texture', randomTexture);
  }

  return params.toString();
}

// Generate avatar URLs with different styles and customized options
export const AVATAR_OPTIONS = AVATAR_STYLES.flatMap((style) =>
  Array(7) // 7 avatars per style = 28 total
    .fill(0)
    .map((_, i) => {
      const options = styleOptions[style];
      const seed = `cool${i + 1}${style}`;
      const params = createAvatarParams(seed, options);
      return `https://api.dicebear.com/7.x/${style}/svg?${params}`;
    })
);

// Function to generate a random avatar URL
export function getRandomAvatarUrl(): string {
  const randomStyle =
    AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = Math.random().toString(36).substring(7);
  const params = createAvatarParams(seed, styleOptions[randomStyle]);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?${params}`;
}

// Function to generate an avatar URL from a name
export function getAvatarUrlFromName(name: string): string {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const params = createAvatarParams(name, styleOptions[style]);
  return `https://api.dicebear.com/7.x/${style}/svg?${params}`;
}

export const DEFAULT_AVATAR = `https://api.dicebear.com/7.x/notionists/svg?seed=default&backgroundColor=${AVATAR_BACKGROUND.color}&style=shape`;

export function generateAvatar(seed: string): string {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const params = createAvatarParams(seed, styleOptions[style]);
  return `https://api.dicebear.com/7.x/${style}/svg?${params}`;
}

// Fun loading messages
export const LOADING_MESSAGES = [
  '🎨 Chargement des utilisateurs...',
  '🎭 Préparation de votre expérience...',
  '🎪 Mise en place de la scène...',
  '🎯 Presque prêt...',
  '🎲 Configuration en cours...',
  '🎸 Accordage des instruments...',
  '🎭 Les acteurs se préparent...',
  '🎪 Le spectacle va commencer...',
];
