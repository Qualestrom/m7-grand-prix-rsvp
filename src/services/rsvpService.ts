import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_URL_KEY) : null;
    const customKey = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_KEY_KEY) : null;

    const supabaseUrl = customUrl || envUrl;
    const supabaseKey = customKey || envKey;

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
      this.initSupabase();
      return false;
    }

    localStorage.setItem(SUPABASE_CUSTOM_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_CUSTOM_KEY_KEY, key.trim());
    return this.initSupabase();
  }

  public getSupabaseConfig(): { url: string; key: string; isCustom: boolean } {
    const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_URL_KEY) || '' : '';
    const customKey = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_CUSTOM_KEY_KEY) || '' : '';
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    return {
      url: customUrl || envUrl,
      key: customKey || envKey,
      isCustom: Boolean(customUrl && customKey),
    };
  }

  // Test live connection to Supabase
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.supabase) {
      return { success: false, message: 'Supabase credentials not configured.' };
    }

    try {
      const { data, error } = await this.supabase
        .from('rsvps')
        .select('id')
        .limit(1);

      if (error) {
        return { success: false, message: error.message };
      }

      this.isSupabaseConnected = true;
      return { success: true, message: `Connected! Table 'rsvps' verified (${data?.length ?? 0} existing records checked).` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      return { success: false, message: msg };
    }
  }

  // Submit new RSVP
  async submitRsvp(input: RsvpInput): Promise<{ success: boolean; data?: RsvpRecord; error?: string }> {
    const newRecord: RsvpRecord = {
      ...input,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rsvp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Save locally
    const local = this.getLocalRecords();
    const existingIdx = local.findIndex((r) => r.id === newRecord.id || (r.guest_name.toLowerCase() === newRecord.guest_name.toLowerCase() && r.guest_name.trim().length > 0));

    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], ...newRecord };
    } else {
      local.unshift(newRecord);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
      this.saveActiveUserRsvp(newRecord);
    } catch (e) {
      console.warn('LocalStorage error:', e);
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
          console.error('Supabase insert error, saved locally:', error);
          return { success: true, data: newRecord };
        }

        const remoteRecord = data as RsvpRecord;
        this.saveActiveUserRsvp(remoteRecord);
        return { success: true, data: remoteRecord };
      } catch (err: unknown) {
        console.warn('Network error inserting to Supabase, saved locally:', err);
        return { success: true, data: newRecord };
      }
    }

    return { success: true, data: newRecord };
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
