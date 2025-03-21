import { TrackingEventDetails, TrackingEventValue } from '@openfeature/server-sdk';

/**
 * Translate {@link TrackingEventDetails} to an object suitable for use as the data
 * parameter in LDClient.track().
 * @param details The {@link TrackingEventDetails} to translate.
 * @returns An object suitable use as the data parameter in LDClient.track().
 * The value attribute will be removed and if the resulting object is empty,
 * returns undefined.
 *
 * @internal
 */
export default function translateTrackingEventDetails(
  details: TrackingEventDetails,
): Record<string, TrackingEventValue> | undefined {
  const { value, ...data } = details;
  return Object.keys(data).length ? data : undefined;
}
