import { Platform, NativeModules } from 'react-native';

// Requires com.apple.developer.family-controls entitlement enabled in Apple Developer portal
// iOS only allows users to confirm app selection — bundle IDs com.burbn.instagram and
// com.zhiliaoapp.musically are pre-targeted but the user must confirm via the native iOS picker.
// This is an Apple security requirement and cannot be bypassed.

const { FamilyControls } = NativeModules as {
  FamilyControls: {
    requestAuthorization: () => Promise<boolean>;
    blockApps: (isBlocked: boolean) => Promise<boolean>;
    presentAppPicker: () => Promise<string>;
    clearAllShields: () => void;
  } | undefined;
};

function isAvailable(): boolean {
  return Platform.OS === 'ios' && !!FamilyControls;
}

export async function requestFamilyControlsAuthorization(): Promise<boolean> {
  if (!isAvailable()) return false;
  try {
    return await FamilyControls!.requestAuthorization();
  } catch {
    return false;
  }
}

export async function blockSelectedApps(block: boolean): Promise<boolean> {
  if (!isAvailable()) return false;
  try {
    return await FamilyControls!.blockApps(block);
  } catch {
    return false;
  }
}

export async function presentAppPicker(): Promise<string> {
  if (!isAvailable()) return 'unavailable';
  try {
    return await FamilyControls!.presentAppPicker();
  } catch {
    return 'error';
  }
}

export function clearAllShields(): void {
  if (!isAvailable()) return;
  FamilyControls!.clearAllShields();
}
