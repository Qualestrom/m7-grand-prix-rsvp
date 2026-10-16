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

const LOCAL_STORAGE_KEY = 'm7_grand_prix_rsvps_v1';

// Initial sample drivers for realistic Pit Wall telemetry demonstration
const SAMPLE_RSVPS: RsvpRecord[] = [
  {
    id: 'sample-1',
    guest_name: 'Uncle Carlos & Aunt Maria',
    relationship: 'Family / Relative',
    attending: true,
    companions: [
      { id: 'c1', fullName: 'Mateo (Cousin)', type: 'Kid' },
      { id: 'c2', fullName: 'Sofia (Cousin)', type: 'Kid' }
    ],
    total_headcount: 3,
    message: 'Happy 7th Birthday Mattheu! Full throttle all year!',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'sample-2',
    guest_name: 'Coach Marcus',
    relationship: 'Schoolmate / Friend',
    attending: true,
    companions: [
      { id: 'c3', fullName: 'Lucas Marcus', type: 'Kid' }
    ],
    total_headcount: 2,
    message: 'Looking forward to the Grand Prix racing games!',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'sample-3',
    guest_name: 'Tito Dave',
    relationship: 'Ninong / Ninang',
    attending: false,
    companions: [],
    total_headcount: 1,
    message: 'Will be out of town for business. Happy Birthday Mattheu champ!',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

class RsvpService {
  private supabase: SupabaseClient | null = null;
  public isSupabaseConnected: boolean = false;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isSupabaseConnected = true;
      } catch (err) {
        console.warn('Supabase initialization fallback to LocalStorage:', err);
      }
    }

    // Initialize LocalStorage with sample data if empty
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_RSVPS));
    }
  }

  // Submit new RSVP
  async submitRsvp(input: RsvpInput): Promise<{ success: boolean; data?: RsvpRecord; error?: string }> {
    const newRecord: RsvpRecord = {
      ...input,
      id: crypto.randomUUID ? crypto.randomUUID() : `rsvp-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // Always persist to LocalStorage first for instant responsiveness
    try {
      const local = this.getLocalRecords();
      local.unshift(newRecord);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // If Supabase is connected, attempt remote insert
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
              message: input.message || ''
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error, saved locally:', error);
          return { success: true, data: newRecord };
        }

        return { success: true, data: data as RsvpRecord };
      } catch (err: unknown) {
        console.warn('Network error inserting to Supabase, saved locally:', err);
        return { success: true, data: newRecord };
      }
    }

    return { success: true, data: newRecord };
  }

  // Get all RSVPs
  async getAllRsvps(): Promise<RsvpRecord[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('rsvps')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as RsvpRecord[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local:', err);
      }
    }

    return this.getLocalRecords();
  }

  // Helper to read LocalStorage
  private getLocalRecords(): RsvpRecord[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Reset or seed demo data
  resetLocalDemo(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_RSVPS));
  }
}

export const rsvpService = new RsvpService();
