export function preloadImages(urls: string[]) {
  if (typeof window !== 'undefined') {
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }
}

export function preloadAvatars() {
  const avatarUrls = [
    '/avatars/1.png',
    '/avatars/2.png',
    '/avatars/3.png',
    '/avatars/4.png',
    '/avatars/5.png',
    '/avatars/6.png',
  ];

  preloadImages(avatarUrls);
}
