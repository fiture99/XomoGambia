import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BIOMETRIC_ENABLED_KEY = "xomo_biometric_enabled";

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function getBiometricType(): Promise<"fingerprint" | "face" | "iris" | "none"> {
  if (Platform.OS === "web") return "none";
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return "face";
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return "fingerprint";
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return "iris";
  } catch {}
  return "none";
}

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return val === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? "true" : "false");
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Sign in to XomoGambia",
      fallbackLabel: "Use Password",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
