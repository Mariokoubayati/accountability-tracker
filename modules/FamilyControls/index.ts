import { NativeModules, Platform } from 'react-native';

// Requires com.apple.developer.family-controls entitlement enabled in Apple Developer portal
// iOS only allows users to confirm app selection — bundle IDs com.burbn.instagram and
// com.zhiliaoapp.musically are pre-targeted but the user must confirm via the native iOS picker.
// This is an Apple security requirement and cannot be bypassed.

export interface FamilyControlsInterface {
  requestAuthorization(): Promise<boolean>;
  blockApps(isBlocked: boolean): Promise<boolean>;
  presentAppPicker(): Promise<string>;
  clearAllShields(): void;
}

const { FamilyControls } = NativeModules as {
  FamilyControls: FamilyControlsInterface | undefined;
};

export default FamilyControls;
