import IGeometry from './IGeometry.js';
import IImage from './IImage.js';
import IImageVolume from './IImageVolume.js';

/**
 * ImageLoadObject interface which any imageLoader should return
 */
export interface IImageLoadObject {
  /** promise that resolves to an image */
  promise: Promise<IImage>;
  /** optional cancel function for loading*/
  cancelFn?: () => void;
  /** optional decache function */
  decache?: () => void;
}

/**
 * VolumeLoadObject interface which any volumeLoader should return
 */
export interface IVolumeLoadObject {
  /** promise that resolves to an ImageVolume */
  promise: Promise<IImageVolume>;
  /** optional cancel function for loading*/
  cancelFn?: () => void;
  /** optional decache function */
  decache?: () => void;
}

export interface IGeometryLoadObject {
  /** promise that resolves to an ImageVolume */
  promise: Promise<IGeometry>;
  /** optional cancel function for loading*/
  cancelFn?: () => void;
  /** optional decache function */
  decache?: () => void;
}
