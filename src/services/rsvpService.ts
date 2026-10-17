import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../config/supabaseConfig';

export interface Companion {
  id: string;
  fullName: string;
  type: 'Kid' | 'Adult';
}

export interface RsvpRecord {
  id: string;
  guest_name: string;
  relationship: string;
  attending: boolean;
  companions: Companion[];
  total_headcount: number;
  message?: string;
  created_at: string;
}

export type RsvpInput = Omit<RsvpRecord, 'id' | 'created_at'>;

const LOCAL_STORAGE_KEY = 'm7_grand_prix_rsvps_v2';
const USER_ACTIVE_RSVP_KEY = 'm7_user_confirmed_rsvp_v2';
const SUPABASE_CUSTOM_URL_KEY = 'm7_supabase_custom_url';
const SUPABASE_CUSTOM_KEY_KEY = 'm7_supabase_custom_key';

class RsvpService {
  private supabase: SupabaseClient | null = null;
  public isSupabaseConnected: boolean = false;
  public connectionError: string | null = null;

  constructor() {
    this.initSupabase();
  }

  // Initialize or re-initialize Supabase client
  public initSupabase(): boolean {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
    const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

    const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_URL_KEY) : null;
    const customKey = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_KEY_KEY) : null;

    // Hierarchy: 1. Custom runtime override in Pit Wall Admin -> 2. Vite .env -> 3. Default project credentials
    const supabaseUrl = (customUrl && customUrl.startsWith('http')) ? customUrl.trim() : (envUrl && envUrl.startsWith('http')) ? envUrl.trim() : DEFAULT_SUPABASE_URL;
    const supabaseKey = (customKey && customKey.trim().length > 20) ? customKey.trim() : (envKey && envKey.trim().length > 20) ? envKey.trim() : DEFAULT_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });
        this.isSupabaseConnected = true;
        this.connectionError = null;
        return true;
      } catch (err: unknown) {
        console.warn('Supabase initialization failed:', err);
        this.supabase = null;
        this.isSupabaseConnected = false;
        this.connectionError = err instanceof Error ? err.message : 'Invalid Supabase credentials';
        return false;
      }
    }

    this.supabase = null;
    this.isSupabaseConnected = false;
    return false;
  }

  // Save custom Supabase credentials from UI
  public setCustomSupabaseConfig(url: string, key: string): boolean {
    if (!url.trim() || !key.trim()) {
      localStorage.removeItem(SUPABASE_CUSTOM_URL_KEY);
      localStorage.removeItem(SUPABASE_CUSTOM_KEY_KEY);
      return this.initSupabase();
    }

    try {
      localStorage.setItem(SUPABASE_CUSTOM_URL_KEY, url.trim());
      localStorage.setItem(SUPABASE_CUSTOM_KEY_KEY, key.trim());
      return this.initSupabase();
    } catch {
      return false;
    }
  }

  public getSupabaseConfig(): { url: string; key: string; isCustom: boolean; isDefault: boolean } {
    const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_URL_KEY) : '';
    const customKey = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_KEY_KEY) : '';
    const envUrl = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '') || '';
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '') || '';

    const effectiveUrl = (customUrl && customUrl.startsWith('http')) ? customUrl : (envUrl && envUrl.startsWith('http')) ? envUrl : DEFAULT_SUPABASE_URL;
    const effectiveKey = (customKey && customKey.length > 20) ? customKey : (envKey && envKey.length > 20) ? envKey : DEFAULT_SUPABASE_ANON_KEY;

    return {
      url: effectiveUrl,
      key: effectiveKey,
      isCustom: Boolean(customUrl && customKey),
      isDefault: !customUrl && !envUrl,
    };
  }

  // Test live connection to Supabase
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.supabase) {
      this.initSupabase();
    }

    if (!this.supabase) {
      return { success: false, message: 'Supabase credentials not configured.' };
    }

    try {
      const { data, error } = await this.supabase
        .from('rsvps')
        .select('id')
        .limit(1);

      if (error) {
        this.isSupabaseConnected = false;
        return { success: false, message: error.message };
      }

      this.isSupabaseConnected = true;
      return { success: true, message: `Connected to Supabase! Table 'rsvps' verified (${data?.length ?? 0} existing records checked).` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      this.isSupabaseConnected = false;
      return { success: false, message: msg };
    }
  }

  // Save record to local storage cache
  public saveLocalRecord(record: RsvpRecord): void {
    const local = this.getLocalRecords();
    const existingIdx = local.findIndex((r) => r.id === record.id || (r.guest_name.toLowerCase() === record.guest_name.toLowerCase() && r.guest_name.trim().length > 0));

    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], ...record };
    } else {
      local.unshift(record);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  // Submit new RSVP
  async submitRsvp(input: RsvpInput): Promise<{ success: boolean; data?: RsvpRecord; error?: string }> {
    const fallbackRecord: RsvpRecord = {
      ...input,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rsvp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (!this.supabase) {
      this.initSupabase();
    }

    // Insert into Supabase if connected
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('rsvps')
          .insert([
            {
              guest_name: input.guest_name,
              relationship: input.relationship,
              attending: input.attending,
              companions: input.companions,
              total_headcount: input.total_headcount,
              message: input.message || '',
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error, saved locally as fallback:', error);
          this.saveLocalRecord(fallbackRecord);
          this.saveActiveUserRsvp(fallbackRecord);
          return { success: true, data: fallbackRecord, error: error.message };
        }

        const remoteRecord = data as RsvpRecord;
        this.saveLocalRecord(remoteRecord);
        this.saveActiveUserRsvp(remoteRecord);
        return { success: true, data: remoteRecord };
      } catch (err: unknown) {
        console.warn('Network error inserting to Supabase, saved locally:', err);
        this.saveLocalRecord(fallbackRecord);
        this.saveActiveUserRsvp(fallbackRecord);
        return { success: true, data: fallbackRecord };
      }
    }

    this.saveLocalRecord(fallbackRecord);
    this.saveActiveUserRsvp(fallbackRecord);
    return { success: true, data: fallbackRecord };
  }

  // Update existing RSVP (from Guest UI or Admin)
  async updateRsvp(id: string, updates: Partial<RsvpRecord>): Promise<{ success: boolean; data?: RsvpRecord; error?: string }> {
    // 1. Update in LocalStorage
    const local = this.getLocalRecords();
    const idx = local.findIndex((r) => r.id === id);
    let updatedRecord: RsvpRecord | null = null;

    if (idx >= 0) {
      updatedRecord = { ...local[idx], ...updates };
      local[idx] = updatedRecord;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
      } catch (e) {
        console.warn('LocalStorage update error:', e);
      }
    }

    // Sync active user if it's the current user
    const active = this.getActiveUserRsvp();
    if (active && active.id === id && updatedRecord) {
      this.saveActiveUserRsvp(updatedRecord);
    }

    if (!this.supabase) {
      this.initSupabase();
    }

    // 2. Update in Supabase
    if (this.supabase) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.guest_name !== undefined) payload.guest_name = updates.guest_name;
        if (updates.relationship !== undefined) payload.relationship = updates.relationship;
        if (updates.attending !== undefined) payload.attending = updates.attending;
        if (updates.companions !== undefined) payload.companions = updates.companions;
        if (updates.total_headcount !== undefined) payload.total_headcount = updates.total_headcount;
        if (updates.message !== undefined) payload.message = updates.message;

        const { data, error } = await this.supabase
          .from('rsvps')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          return { success: !!updatedRecord, data: updatedRecord || undefined, error: error.message };
        }

        if (data) {
          const remoteRecord = data as RsvpRecord;
          this.saveLocalRecord(remoteRecord);
          if (active && active.id === id) {
            this.saveActiveUserRsvp(remoteRecord);
          }
          return { success: true, data: remoteRecord };
        }
      } catch (err: unknown) {
        console.warn('Network error updating Supabase:', err);
      }
    }

    return { success: !!updatedRecord, data: updatedRecord || undefined };
  }

  // Delete RSVP (Admin capability)
  async deleteRsvp(id: string): Promise<{ success: boolean; error?: string }> {
    // Remove locally
    const local = this.getLocalRecords().filter((r) => r.id !== id);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
    } catch (e) {
      console.warn('LocalStorage delete error:', e);
    }

    const active = this.getActiveUserRsvp();
    if (active && active.id === id) {
      this.clearActiveUserRsvp();
    }

    if (!this.supabase) {
      this.initSupabase();
    }

    // Remove from Supabase
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('rsvps')
          .delete()
          .eq('id', id);

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Network error' };
      }
    }

    return { success: true };
  }

  // Get all RSVPs (Admin Telemetry)
  async getAllRsvps(): Promise<RsvpRecord[]> {
    if (!this.supabase) {
      this.initSupabase();
    }

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('rsvps')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Sync remote into local storage cache
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          } catch {
            // Ignore quota issues
          }
          return data as RsvpRecord[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage cache:', err);
      }
    }

    return this.getLocalRecords();
  }

  // Verify with Supabase if the user's active RSVP still exists in the database.
  // If an admin deleted their response, this automatically clears their local cache
  // so their page reverts to a fresh invitation and they can respond newly.
  public async verifyActiveUserRsvp(): Promise<RsvpRecord | null> {
    const cached = this.getActiveUserRsvp();
    if (!cached) return null;

    if (!this.supabase) {
      this.initSupabase();
    }

    if (this.supabase && cached.id) {
      try {
        const { data, error } = await this.supabase
          .from('rsvps')
          .select('*')
          .eq('id', cached.id)
          .maybeSingle();

        if (error) {
          // Network issue or offline: gracefully retain cached state
          return cached;
        }

        if (!data) {
          // Record was deleted from Supabase (by admin) -> clear local state!
          this.clearActiveUserRsvp();
          return null;
        }

        // Record exists and may have been updated by admin
        const verified = data as RsvpRecord;
        this.saveActiveUserRsvp(verified);
        this.saveLocalRecord(verified);
        return verified;
      } catch {
        return cached;
      }
    }

    return cached;
  }

  // Active user's confirmed RSVP state
  public getActiveUserRsvp(): RsvpRecord | null {
    try {
      const raw = localStorage.getItem(USER_ACTIVE_RSVP_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveActiveUserRsvp(record: RsvpRecord): void {
    try {
      localStorage.setItem(USER_ACTIVE_RSVP_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('Could not save user RSVP:', e);
    }
  }

  public clearActiveUserRsvp(): void {
    try {
      localStorage.removeItem(USER_ACTIVE_RSVP_KEY);
    } catch {
      // Ignore
    }
  }

  // Clear demo / sample mock records
  public clearAllRecords(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(USER_ACTIVE_RSVP_KEY);
      localStorage.removeItem(SUPABASE_CUSTOM_URL_KEY);
      localStorage.removeItem(SUPABASE_CUSTOM_KEY_KEY);
      this.initSupabase();
    } catch {
      // Ignore
    }
  }

  // Read local records
  public getLocalRecords(): RsvpRecord[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const rsvpService = new RsvpService();
