/** Stub for Expo Go — real module requires a development build. */

export const SdkAvailabilityStatus = {
  SDK_AVAILABLE: 1,
  SDK_UNAVAILABLE: 2,
  SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 3,
};

export async function getSdkStatus() {
  return SdkAvailabilityStatus.SDK_UNAVAILABLE;
}

export async function initialize() {
  return false;
}

export async function requestPermission(_permissions?: unknown) {
  return [];
}

export async function readRecords(_type: string, _options?: unknown) {
  return { records: [] as { count?: number }[] };
}
