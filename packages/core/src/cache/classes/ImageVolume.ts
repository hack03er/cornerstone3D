import { getMinMax, imageIdToURI } from '../../utilities';
import {
  IImageVolume,
  IImage,
  IImageLoadObject,
  ImageVolumeProps,
  PixelDataTypedArray,
} from '../../types';
import cache from '../cache';
import * as metaData from '../../metaData';
import { MetadataModules } from '../../enums';
import Volume from './Volume';

/**
 * The base class for volume data. It includes the volume metadata
 * and the volume data along with the loading status.
 * This class still does not implement a load method as the
 * scalarData and other information for volume creation should be
 * provided to the constructor. The only benefit of this
 * class is that it provides decaching into images if needed
 */
export class ImageVolume extends Volume implements IImageVolume {
  private _imageIdsIndexMap = new Map();
  private _imageURIsIndexMap = new Map();
  private _imageCacheOffsetMap = new Map();
  protected numFrames: number;
  protected totalNumFrames: number;
  /**
   * optional referenced image ids if the volume is derived from a set of images
   */
  referencedImageIds?: Array<string>;

  /** metadata for converting the volume to cornerstoneImage */
  cornerstoneImageMetaData?: Record<string, any>;

  constructor(props: ImageVolumeProps) {
    super(props);

    this.imageIds = props.imageIds || [];
    this._reprocessImageIds();

    if (props.referencedImageIds) {
      this.referencedImageIds = props.referencedImageIds;
    }

    this.numFrames = this.getNumFrames();
    this.preComputeMetadata();
  }

  cancelLoading: () => void;

  /**
   * This is a map of imageId to offset in case the volume were generated
   * while the same images were already in the cache in the _imageCache, this
   * way we can keep track of the offset of each imageId in the volume
   * so that we perform cache optimizations.
   *
   */
  public get imageCacheOffsetMap(): Map<string, any> {
    return this._imageCacheOffsetMap;
  }

  /**
   * Converts the requested imageId inside the volume to a cornerstoneImage
   * object. It uses the typedArray set method to copy the pixelData from the
   * correct offset in the scalarData to a new array for the image
   *
   * @param imageId - the imageId of the image to be converted
   * @param imageIdIndex - the index of the imageId in the imageIds array
   * @returns image object containing the pixel data, metadata, and other information
   */
  public getCornerstoneImage(imageId: string, imageIdIndex: number): IImage {
    const { imageIds } = this;
    const frameIndex = this.imageIdIndexToFrameIndex(imageIdIndex);

    const {
      bytesPerImage,
      pixelsPerImage,
      windowCenter,
      windowWidth,
      numComponents,
      color,
      dimensions,
      spacing,
      invert,
      voiLUTFunction,
      photometricInterpretation,
    } = this.cornerstoneImageMetaData;

    // 1. Grab the buffer and it's type
    const scalarData = this.getScalarDataByImageIdIndex(imageIdIndex);
    const volumeBuffer = scalarData.buffer;
    // (not sure if this actually works, TypeScript keeps complaining)
    const TypedArray = scalarData.constructor;

    // 2. Given the index of the image and frame length in bytes,
    //    create a view on the volume arraybuffer
    const bytePerPixel = bytesPerImage / pixelsPerImage;

    let byteOffset = bytesPerImage * frameIndex;

    // If there is a discrepancy between the volume typed array
    // and the bitsAllocated for the image. The reason is that VTK uses Float32
    // on the GPU and if the type is not Float32, it will convert it. So for not
    // having a performance issue, we convert all types initially to Float32 even
    // if they are not Float32.
    if (scalarData.BYTES_PER_ELEMENT !== bytePerPixel) {
      byteOffset *= scalarData.BYTES_PER_ELEMENT / bytePerPixel;
    }

    // 3. Create a new TypedArray of the same type for the new
    //    Image that will be created
    // @ts-ignore
    const imageScalarData = new TypedArray(pixelsPerImage);
    // @ts-ignore
    const volumeBufferView = new TypedArray(
      volumeBuffer,
      byteOffset,
      pixelsPerImage
    );

    // 4. Use e.g. TypedArray.set() to copy the data from the larger
    //    buffer's view into the smaller one
    imageScalarData.set(volumeBufferView);

    // 5. Create an Image Object from imageScalarData and put it into the Image cache
    const volumeImageId = imageIds[imageIdIndex];
    const modalityLutModule =
      metaData.get(MetadataModules.VOI_LUT, volumeImageId) || {};
    const minMax = getMinMax(imageScalarData);
    const intercept = modalityLutModule.rescaleIntercept
      ? modalityLutModule.rescaleIntercept
      : 0;

    return {
      imageId,
      intercept,
      windowCenter,
      windowWidth,
      voiLUTFunction,
      color,
      rgba: false,
      numComps: numComponents,
      // Note the dimensions were defined as [Columns, Rows, Frames]
      rows: dimensions[1],
      columns: dimensions[0],
      sizeInBytes: imageScalarData.byteLength,
      getPixelData: () => imageScalarData,
      minPixelValue: minMax.min,
      maxPixelValue: minMax.max,
      slope: modalityLutModule.rescaleSlope
        ? modalityLutModule.rescaleSlope
        : 1,
      getCanvas: undefined, // todo: which canvas?
      height: dimensions[0],
      width: dimensions[1],
      columnPixelSpacing: spacing[0],
      rowPixelSpacing: spacing[1],
      invert,
      photometricInterpretation,
    };
  }

  /**
   * Converts the requested imageId inside the volume to a cornerstoneImage
   * object. It uses the typedArray set method to copy the pixelData from the
   * correct offset in the scalarData to a new array for the image
   * Duplicate of getCornerstoneImageLoadObject for legacy reasons
   *
   * @param imageId - the imageId of the image to be converted
   * @param imageIdIndex - the index of the imageId in the imageIds array
   * @returns imageLoadObject containing the promise that resolves
   * to the cornerstone image
   */
  public convertToCornerstoneImage(
    imageId: string,
    imageIdIndex: number
  ): IImageLoadObject {
    return this.getCornerstoneImageLoadObject(imageId, imageIdIndex);
  }

  /**
   * Converts the requested imageId inside the volume to a cornerstoneImage
   * object. It uses the typedArray set method to copy the pixelData from the
   * correct offset in the scalarData to a new array for the image
   *
   * @param imageId - the imageId of the image to be converted
   * @param imageIdIndex - the index of the imageId in the imageIds array
   * @returns imageLoadObject containing the promise that resolves
   * to the cornerstone image
   */
  public getCornerstoneImageLoadObject(
    imageId: string,
    imageIdIndex: number
  ): IImageLoadObject {
    const image = this.getCornerstoneImage(imageId, imageIdIndex);

    const imageLoadObject = {
      promise: Promise.resolve(image),
    };

    return imageLoadObject;
  }

  /**
   * Returns an array of all the volume's images as Cornerstone images.
   * It iterates over all the imageIds and converts them to Cornerstone images.
   *
   * @returns An array of Cornerstone images.
   */
  public getCornerstoneImages(): IImage[] {
    const { imageIds } = this;

    return imageIds.map((imageId, imageIdIndex) => {
      return this.getCornerstoneImage(imageId, imageIdIndex);
    });
  }

  /**
   * Converts all the volume images (imageIds) to cornerstoneImages and caches them.
   * It iterates over all the imageIds and convert them until there is no
   * enough space left inside the imageCache. Finally it will decache the Volume.
   *
   */
  public convertToImagesAndCache(removeFromCache = true) {
    // 1. Try to decache images in the volatile Image Cache to provide
    //    enough space to store another entire copy of the volume (as Images).
    //    If we do not have enough, we will store as many images in the cache
    //    as possible, and the rest of the volume will be decached.
    const byteLength = this.sizeInBytes;
    const numImages = this.imageIds.length;
    const { bytesPerImage } = this.cornerstoneImageMetaData;

    let bytesRemaining = cache.decacheIfNecessaryUntilBytesAvailable(
      byteLength,
      this.imageIds
    );

    for (let imageIdIndex = 0; imageIdIndex < numImages; imageIdIndex++) {
      const imageId = this.imageIds[imageIdIndex];

      bytesRemaining = bytesRemaining - bytesPerImage;
      // 2. Convert each imageId to a cornerstone Image object which is
      // resolved inside the promise of imageLoadObject
      const imageLoadObject = this.convertToCornerstoneImage(
        imageId,
        imageIdIndex
      );

      // 3. Caching the image
      if (!cache.getImageLoadObject(imageId)) {
        cache.putImageLoadObject(imageId, imageLoadObject).catch((err) => {
          console.error(err);
        });
      }

      // 4. If we know we won't be able to add another Image to the cache
      //    without breaching the limit, stop here.
      if (bytesRemaining <= bytesPerImage) {
        break;
      }
    }
    // 5. When as much of the Volume is processed into Images as possible
    //    without breaching the cache limit, remove the Volume
    if (removeFromCache) {
      this.removeFromCache();
    }
  }

  /**
   * return the index of a given imageId
   * @param imageId - imageId
   * @returns imageId index
   */
  public getImageIdIndex(imageId: string): number {
    return this._imageIdsIndexMap.get(imageId);
  }

  /**
   * return the index of a given imageURI, imageURI is imageId without
   * the loader schema.
   * @param imageId - imageURI
   * @returns imageURI index
   */
  public getImageURIIndex(imageURI: string): number {
    return this._imageURIsIndexMap.get(imageURI);
  }

  /**
   * If completelyRemove is true, remove the volume completely from the cache. Otherwise,
   * convert the volume to cornerstone images (stack images) and store it in the cache
   * @param completelyRemove - If true, the image will be removed from the
   * cache completely.
   */
  public decache(completelyRemove = false): void {
    if (completelyRemove) {
      this.removeFromCache();
    } else {
      this.convertToImagesAndCache();
    }
  }

  /**
   * Returns the number of frames stored in a scalarData object. The number of
   * frames is equal to the number of images for 3D volumes or the number of
   * frames per time points for 4D volumes.
   * @returns number of frames per volume
   */
  protected getNumFrames(): number {
    const { imageIds, scalarData } = this;
    const scalarDataCount = this.isDynamicVolume() ? scalarData.length : 1;

    return imageIds.length / scalarDataCount;
  }

  /**
   * Converts imageIdIndex into frameIndex which will be the same
   * for 3D volumes but different for 4D volumes
   */
  protected imageIdIndexToFrameIndex(imageIdIndex: number): number {
    return imageIdIndex % this.numFrames;
  }

  protected getScalarDataByImageIdIndex(
    imageIdIndex: number
  ): PixelDataTypedArray {
    if (imageIdIndex < 0 || imageIdIndex >= this.imageIds.length) {
      throw new Error('imageIdIndex out of range');
    }

    const scalarDataArrays = this.getScalarDataArrays();
    const scalarDataIndex = Math.floor(imageIdIndex / this.numFrames);

    return scalarDataArrays[scalarDataIndex];
  }

  /**
   * Creates the metadata required for converting the volume to an cornerstoneImage
   */
  protected preComputeMetadata() {
    const { numFrames } = this;

    if (numFrames === 0) {
      return;
    }

    const bytesPerImage = this.sizeInBytes / numFrames;
    const scalarDataLength = this.getScalarDataLength();
    const numComponents = scalarDataLength / this.numVoxels;
    const pixelsPerImage =
      this.dimensions[0] * this.dimensions[1] * numComponents;

    const { PhotometricInterpretation, voiLut, VOILUTFunction } = this.metadata;

    let windowCenter = [];
    let windowWidth = [];

    if (voiLut && voiLut.length) {
      windowCenter = voiLut.map((voi) => {
        return voi.windowCenter;
      });

      windowWidth = voiLut.map((voi) => {
        return voi.windowWidth;
      });
    }

    const color = numComponents > 1 ? true : false; //todo: fix this

    this.cornerstoneImageMetaData = {
      bytesPerImage,
      numComponents,
      pixelsPerImage,
      windowCenter,
      windowWidth,
      color,
      // we use rgb (3 components) for the color volumes (and not rgba), and not rgba (which is used
      // in some parts of the lib for stack viewing in CPU)
      rgba: false,
      spacing: this.spacing,
      dimensions: this.dimensions,
      photometricInterpretation: PhotometricInterpretation,
      voiLUTFunction: VOILUTFunction,
      invert: PhotometricInterpretation === 'MONOCHROME1',
    };
  }

  private _reprocessImageIds() {
    this._imageIdsIndexMap.clear();
    this._imageURIsIndexMap.clear();

    this.imageIds?.forEach((imageId, i) => {
      const imageURI = imageIdToURI(imageId);

      this._imageIdsIndexMap.set(imageId, i);
      this._imageURIsIndexMap.set(imageURI, i);
    });
  }
}

export default ImageVolume;
