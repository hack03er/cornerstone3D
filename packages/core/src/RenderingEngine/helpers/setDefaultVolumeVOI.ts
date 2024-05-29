import {
  VolumeActor,
  IImageVolume,
  VOIRange,
  ScalingParameters,
} from '../../types/index.js';
import { loadAndCacheImage } from '../../loaders/imageLoader.js';
import * as metaData from '../../metaData.js';
import { getMinMax, windowLevel } from '../../utilities/index.js';
import { RequestType } from '../../enums/index.js';
import cache from '../../cache/index.js';

const PRIORITY = 0;
const REQUEST_TYPE = RequestType.Prefetch;

/**
 * It sets the default window level of an image volume based on the VOI.
 * It first look for the VOI in the metadata and if it is not found, it
 * loads the middle slice image (middle imageId) and based on its min
 * and max pixel values, it calculates the VOI.
 * Finally it sets the VOI on the volumeActor transferFunction
 * @param volumeActor - The volume actor
 * @param imageVolume - The image volume that we want to set the VOI for.
 * @param useNativeDataType -  The image data type is native or Float32Array
 */
async function setDefaultVolumeVOI(
  volumeActor: VolumeActor,
  imageVolume: IImageVolume,
  useNativeDataType: boolean
): Promise<void> {
  let voi = getVOIFromMetadata(imageVolume);

  if (!voi && imageVolume?.imageIds?.length) {
    voi = await getVOIFromMinMax(imageVolume, useNativeDataType);
    voi = handlePreScaledVolume(imageVolume, voi);
  }
  // if (!voi || voi.lower === undefined || voi.upper === undefined) {
  //   throw new Error(
  //     'Could not get VOI from metadata, nor from the min max of the image middle slice'
  //   );
  // }
  if (
    (voi?.lower === 0 && voi?.upper === 0) ||
    voi?.lower === undefined ||
    voi?.upper === undefined
  ) {
    return;
  }

  volumeActor
    .getProperty()
    .getRGBTransferFunction(0)
    .setMappingRange(voi.lower, voi.upper);
}

function handlePreScaledVolume(imageVolume: IImageVolume, voi: VOIRange) {
  const imageIds = imageVolume.imageIds;
  const imageIdIndex = Math.floor(imageIds.length / 2);
  const imageId = imageIds[imageIdIndex];

  const generalSeriesModule =
    metaData.get('generalSeriesModule', imageId) || {};

  /**
   * If the volume is prescaled and the modality is PT Sometimes you get super high
   * values at the peak and it skews the min/max so nothing useful is displayed
   * Therefore, we follow the majority of other viewers and we set the min/max
   * for the scaled PT to be 0, 5
   */
  if (_isCurrentImagePTPrescaled(generalSeriesModule.modality, imageVolume)) {
    return {
      lower: 0,
      upper: 5,
    };
  }

  return voi;
}

/**
 * Get the VOI from the metadata of the middle slice of the image volume or the metadata of the image volume
 * It checks the metadata for the VOI and if it is not found, it returns null
 *
 * @param imageVolume - The image volume that we want to get the VOI from.
 * @returns VOIRange with lower and upper values
 */
function getVOIFromMetadata(imageVolume: IImageVolume): VOIRange {
  const { imageIds, metadata } = imageVolume;
  let voi;
  if (imageIds.length) {
    const imageIdIndex = Math.floor(imageIds.length / 2);
    const imageId = imageIds[imageIdIndex];
    const voiLutModule = metaData.get('voiLutModule', imageId);
    if (voiLutModule && voiLutModule.windowWidth && voiLutModule.windowCenter) {
      const { windowWidth, windowCenter } = voiLutModule;
      voi = {
        windowWidth: Array.isArray(windowWidth) ? windowWidth[0] : windowWidth,
        windowCenter: Array.isArray(windowCenter)
          ? windowCenter[0]
          : windowCenter,
      };
    }
  } else {
    voi = metadata?.voiLut?.[0];
  }
  if (voi) {
    const { lower, upper } = windowLevel.toLowHighRange(
      Number(voi.windowWidth),
      Number(voi.windowCenter)
    );
    return {
      lower,
      upper,
    };
  }
}

/**
 * It loads the middle slice image (middle imageId) and based on its min
 * and max pixel values, it calculates the VOI.
 *
 * @param imageVolume - The image volume that we want to get the VOI from.
 * @param useNativeDataType -  The image data type is native or Float32Array
 * @returns The VOIRange with lower and upper values
 */
async function getVOIFromMinMax(
  imageVolume: IImageVolume,
  useNativeDataType: boolean
): Promise<VOIRange> {
  const { imageIds } = imageVolume;
  const scalarData = imageVolume.getScalarData();

  // Get the middle image from the list of imageIds
  const imageIdIndex = Math.floor(imageIds.length / 2);
  const imageId = imageVolume.imageIds[imageIdIndex];
  const generalSeriesModule =
    metaData.get('generalSeriesModule', imageId) || {};
  const { modality } = generalSeriesModule;
  const modalityLutModule = metaData.get('modalityLutModule', imageId) || {};

  const numImages = imageIds.length;
  const bytesPerImage = scalarData.byteLength / numImages;
  const voxelsPerImage = scalarData.length / numImages;
  const bytePerPixel = scalarData.BYTES_PER_ELEMENT;

  const scalingParameters: ScalingParameters = {
    rescaleSlope: modalityLutModule.rescaleSlope,
    rescaleIntercept: modalityLutModule.rescaleIntercept,
    modality,
  };

  let scalingParametersToUse;
  if (modality === 'PT') {
    const suvFactor = metaData.get('scalingModule', imageId);

    if (suvFactor) {
      scalingParametersToUse = {
        ...scalingParameters,
        suvbw: suvFactor.suvbw,
      };
    }
  }

  const byteOffset = imageIdIndex * bytesPerImage;

  const options = {
    targetBuffer: {
      type: useNativeDataType ? undefined : 'Float32Array',
    },
    priority: PRIORITY,
    requestType: REQUEST_TYPE,
    useNativeDataType,
    preScale: {
      enabled: true,
      scalingParameters: scalingParametersToUse,
    },
  };

  // Loading the middle slice image for a volume has two scenarios, the first one is that
  // uses the same volumeLoader which might not resolve to an image (since for performance
  // reasons volumes' pixelData is set via offset and length on the volume arrayBuffer
  // when each slice is loaded). The second scenario is that the image might not reach
  // to the volumeLoader, and an already cached image (with Image object) is used
  // instead. For the first scenario, we use the arrayBuffer of the volume to get the correct
  // slice for the imageScalarData, and for the second scenario we use the getPixelData
  // on the Cornerstone IImage object to get the pixel data.
  // Note: we don't want to use the derived or generated images for setting the
  // default VOI, because they are not the original. This is ugly but don't
  // know how to do it better.
  let image = cache.getImage(imageId);

  if (!imageVolume.referencedImageIds?.length) {
    // we should ignore the cache here,
    // since we want to load the image from with the most
    // recent prescale settings
    image = await loadAndCacheImage(imageId, { ...options, ignoreCache: true });
  }

  const imageScalarData = image
    ? image.getPixelData()
    : _getImageScalarDataFromImageVolume(
        imageVolume,
        byteOffset,
        bytePerPixel,
        voxelsPerImage
      );

  // Get the min and max pixel values of the middle slice
  const { min, max } = getMinMax(imageScalarData);

  return {
    lower: min,
    upper: max,
  };
}

function _getImageScalarDataFromImageVolume(
  imageVolume,
  byteOffset,
  bytePerPixel,
  voxelsPerImage
) {
  const { scalarData } = imageVolume;
  const { buffer } = scalarData;
  if (scalarData.BYTES_PER_ELEMENT !== bytePerPixel) {
    byteOffset *= scalarData.BYTES_PER_ELEMENT / bytePerPixel;
  }

  const TypedArray = scalarData.constructor;
  const imageScalarData = new TypedArray(voxelsPerImage);

  const volumeBufferView = new TypedArray(buffer, byteOffset, voxelsPerImage);

  imageScalarData.set(volumeBufferView);

  return imageScalarData;
}

function _isCurrentImagePTPrescaled(modality, imageVolume) {
  if (modality !== 'PT' || !imageVolume.isPreScaled) {
    return false;
  }

  if (!imageVolume.scaling?.PT.suvbw) {
    return false;
  }

  return true;
}

export default setDefaultVolumeVOI;
