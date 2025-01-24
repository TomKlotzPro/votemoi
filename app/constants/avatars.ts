// Selected Dicebear styles for best variety
const AVATAR_STYLES = [
  'adventurer',
  'avataaars',
  'bottts',
  'fun-emoji',
  'pixel-art',
  'lorelei', // Cute, anime-style avatars
  'notionists', // Professional, minimalist style
  'micah', // Abstract, artistic style
  'open-peeps', // Hand-drawn style
  'personas', // Modern, diverse avatars
];

// Generate avatar URLs with different styles and seeds
export const AVATAR_OPTIONS = AVATAR_STYLES.flatMap((style) =>
  Array.from(
    { length: 3 },
    (_, i) => `https://api.dicebear.com/7.x/${style}/svg?seed=avatar${i + 1}`
  )
);

// Fun loading messages
export const LOADING_MESSAGES = [
  '🎨 Painting pixels with pure imagination...',
  '🎭 Auditioning random avatars...',
  '🎪 Teaching avatars to dance...',
  '🎯 Aiming for the perfect look...',
  '🎲 Rolling the dice for your next avatar...',
  '🎸 Getting the band back together...',
  '🎭 Preparing your digital disguise...',
  '🎪 Training circus avatars...',
  '🎨 Mixing the perfect colors...',
  '🎭 Rehearsing avatar expressions...',
  '🎪 Setting up the avatar parade...',
  '🎯 Calibrating cuteness levels...',
  '🎲 Shuffling personality traits...',
  '🎸 Tuning up the pixel orchestra...',
  '🎭 Applying digital makeup...',
  '🎨 Sketching the perfect smile...',
  '🎭 Polishing pixel perfection...',
  '🎪 Organizing avatar fashion show...',
];

// Function to generate a random avatar URL
export const getRandomAvatarUrl = () => {
  const randomSeed = Math.random().toString(36).substring(7);
  const randomStyle =
    AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`;
};

// Function to generate an avatar URL from a name
export const getAvatarUrlFromName = (name: string) => {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${name}`;
};

export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg';

export function generateAvatar(seed: string): string {
  return `${DEFAULT_AVATAR}?seed=${encodeURIComponent(seed)}`;
}
