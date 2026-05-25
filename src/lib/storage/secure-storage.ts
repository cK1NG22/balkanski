import * as SecureStore from 'expo-secure-store';

// Storage adapter for Supabase Auth conforming to its SupportedStorage shape.
// Backed by expo-secure-store so session tokens land in the iOS Keychain /
// Android EncryptedSharedPreferences instead of plaintext.
//
// expo-secure-store has a per-value size limit (~2 KB on Android, ~4 KB on
// iOS). A Supabase session is typically well under that; if it ever grows
// (e.g., custom JWT claims), switch to a chunked adapter.
export const supabaseSecureStorage = {
  getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
