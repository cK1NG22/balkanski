import { ScriptPrefSchema, type ScriptPref } from '@/data/schemas/user';
import { storage, storageKeys } from '@/lib/storage/mmkv';
import { getSupabase } from '@/lib/supabase';

import type { ScriptPrefIO } from './script-pref';

export const realScriptPrefIO: ScriptPrefIO = {
  getLocal() {
    const raw = storage.getString(storageKeys.serbianScriptPref);
    const parsed = ScriptPrefSchema.safeParse(raw);
    return parsed.success ? parsed.data : 'latin';
  },
  setLocal(pref) {
    storage.set(storageKeys.serbianScriptPref, pref);
  },
  async getRemote(userId) {
    const { data, error } = await getSupabase()
      .from('users')
      .select('serbian_script_pref')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const parsed = ScriptPrefSchema.safeParse(data.serbian_script_pref);
    return parsed.success ? parsed.data : null;
  },
  async setRemote(userId, pref) {
    // RLS users_update_own restricts WHERE id=auth.uid(); passing id=userId
    // is intentional — it's redundant with the policy but makes the row
    // target explicit for any future logging hooks.
    const { error } = await getSupabase()
      .from('users')
      .update({ serbian_script_pref: pref })
      .eq('id', userId);
    if (error) throw new Error(error.message);
  },
};
