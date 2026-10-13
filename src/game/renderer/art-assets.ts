import { Assets, Texture } from 'pixi.js';

/** Relative to <base>, including the GitHub Pages subdirectory. */
export function loadArt(path: string): Promise<Texture> {
  return Assets.load<Texture>({
    src: new URL(`assets/${path}`, document.baseURI).href,
    data: { autoGenerateMipmaps: true, scaleMode: 'linear' },
  });
}
