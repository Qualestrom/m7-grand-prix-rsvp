import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rsvpService, type RsvpRecord, type Companion } from '../services/rsvpService';
import { EVENT_CONFIG } from '../config/eventConfig';
import { M7Logo } from './M7Logo';
import { 
  Lock, 
  Key, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Radio, 
  Database,
  Edit,
  Trash2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  X
} from 'lucide-react';

interface PitWallAdminProps {
  onBackToApp: () => void;
}

export const PitWallAdmin: React.FC<PitWallAdminProps> = ({ onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'attending' | 'dnf'>('all');

  // Supabase Settings Modal
  const [showDbModal, setShowDbModal] = useState<boolean>(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>('');
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Edit Driver Modal
  const [editingRecord, setEditingRecord] = useState<RsvpRecord | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editAttending, setEditAttending] = useState<boolean>(true);
  const [editRelationship, setEditRelationship] = useState<string>('Guest');
  const [editCompanions, setEditCompanions] = useState<Companion[]>([]);
  const [editMessage, setEditMessage] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Add New Driver Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newAttending, setNewAttending] = useState<boolean>(true);
  const [newRelationship, setNewRelationship] = useState<string>('Family / Relative');
  const [newCompanions, setNewCompanions] = useState<Companion[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSavingNew, setIsSavingNew] = useState<boolean>(false);

  // Load existing Supabase config into inputs
  useEffect(() => {
    const config = rsvpService.getSupabaseConfig();
    setSupabaseUrlInput(config.url);
    setSupabaseKeyInput(config.key);
  }, []);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toUpperCase() === EVENT_CONFIG.adminPasscode.toUpperCase()) {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError(`Incorrect Pit Wall Passcode. Hint: ${EVENT_CONFIG.adminPasscode}`);
    }
  };

  const fetchRsvps = async () => {
    setIsLoading(true);
    try {
      const records = await rsvpService.getAllRsvps();
      setRsvps(records);
    } catch (err) {
      console.error('Error fetching RSVPs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRsvps();
    }
  }, [isAuthenticated]);

  // Handle Supabase Connection Test
  const handleTestSupabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);

    // Save inputs first
    rsvpService.setCustomSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    const result = await rsvpService.testConnection();
    setDbTestResult(result);
    setIsTestingDb(false);

    if (result.success) {
      fetchRsvps();
    }
  };

  const handleSaveSupabaseConfig = async () => {
    rsvpService.setCustomSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setShowDbModal(false);
    fetchRsvps();
  };

  // Copy SQL Schema
  const handleCopySql = () => {
    const sql = `-- M7 GRAND PRIX RSVP SCHEMA
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Guest',
    attending BOOLEAN NOT NULL DEFAULT true,
    companions JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_headcount INTEGER NOT NULL DEFAULT 1,
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public RSVP submission" ON public.rsvps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public read for telemetry" ON public.rsvps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public update for RSVPs" ON public.rsvps FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete for RSVPs" ON public.rsvps FOR DELETE TO anon, authenticated USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Purge sample / mock demo data
  const handlePurgeMockData = () => {
    if (window.confirm('Purge sample demo records from the grid? This leaves only genuine live registrations.')) {
      rsvpService.clearAllRecords();
      fetchRsvps();
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (record: RsvpRecord) => {
    setEditingRecord(record);
    setEditName(record.guest_name);
    setEditAttending(record.attending);
    setEditRelationship(record.relationship || 'Guest');
    setEditCompanions(Array.isArray(record.companions) ? [...record.companions] : []);
    setEditMessage(record.message || '');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editName.trim()) return;

    setIsSavingEdit(true);
    try {
      const totalHeadcount = editAttending ? 1 + editCompanions.filter((c) => c.fullName.trim()).length : 0;
      await rsvpService.updateRsvp(editingRecord.id, {
        guest_name: editName.trim(),
        attending: editAttending,
        relationship: editRelationship,
        companions: editCompanions.filter((c) => c.fullName.trim()),
        total_headcount: totalHeadcount,
        message: editMessage.trim(),
      });
      setIsSavingEdit(false);
      setEditingRecord(null);
      fetchRsvps();
    } catch (err) {
      console.error('Error updating RSVP:', err);
      setIsSavingEdit(false);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (record: RsvpRecord) => {
    if (window.confirm(`Are you sure you want to delete ${record.guest_name} from the grid?`)) {
      await rsvpService.deleteRsvp(record.id);
      fetchRsvps();
    }
  };

  // Add New Record (Manual VIP)
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSavingNew(true);
    try {
      const companions = newCompanions.filter((c) => c.fullName.trim());
      const totalHeadcount = newAttending ? 1 + companions.length : 0;

      await rsvpService.submitRsvp({
        guest_name: newName.trim(),
        relationship: newRelationship,
        attending: newAttending,
        companions,
        total_headcount: totalHeadcount,
        message: newMessage.trim(),
      });

      setIsSavingNew(false);
      setShowAddModal(false);
      setNewName('');
      setNewCompanions([]);
      setNewMessage('');
      fetchRsvps();
    } catch (err) {
      console.error('Error adding RSVP:', err);
      setIsSavingNew(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const attendingRecords = rsvps.filter((r) => r.attending);
    const dnfRecords = rsvps.filter((r) => !r.attending);

    let totalHeadcount = 0;
    let kidsCount = 0;
    let adultsCount = 0;

    attendingRecords.forEach((r) => {
      adultsCount += 1;
      totalHeadcount += 1;

      if (Array.isArray(r.companions)) {
        r.companions.forEach((c) => {
          totalHeadcount += 1;
          if (c.type === 'Kid') {
            kidsCount += 1;
          } else {
            adultsCount += 1;
          }
        });
      }
    });

    const relBreakdown: Record<string, number> = {};
    attendingRecords.forEach((r) => {
      const rel = r.relationship || 'Guest';
      relBreakdown[rel] = (relBreakdown[rel] || 0) + (r.total_headcount || 1);
    });

    return {
      totalHeadcount,
      kidsCount,
      adultsCount,
      confirmedDrivers: attendingRecords.length,
      dnfDrivers: dnfRecords.length,
      relBreakdown,
    };
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      if (filterTab === 'attending' && !r.attending) return false;
      if (filterTab === 'dnf' && r.attending) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const matchDriver = (r.guest_name || '').toLowerCase().includes(q);
      const matchRel = (r.relationship || '').toLowerCase().includes(q);
      const matchMsg = (r.message || '').toLowerCase().includes(q);
      const matchCompanions = Array.isArray(r.companions) && r.companions.some((c) => c.fullName.toLowerCase().includes(q));

      return matchDriver || matchRel || matchMsg || matchCompanions;
    });
  }, [rsvps, filterTab, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'Driver Name',
      'Status',
      'Relationship',
      'Total Headcount',
      'Adults',
      'Kids',
      'Companions (Itemized)',
      'Pit Radio Message',
      'Date Submitted',
    ];

    const rows = rsvps.map((r) => {
      const companionsStr = Array.isArray(r.companions)
        ? r.companions.map((c) => `${c.fullName} (${c.type})`).join('; ')
        : '';

      const rKids = Array.isArray(r.companions) ? r.companions.filter((c) => c.type === 'Kid').length : 0;
      const rAdults = r.attending ? 1 + (Array.isArray(r.companions) ? r.companions.filter((c) => c.type === 'Adult').length : 0) : 0;

      return [
        `"${r.guest_name.replace(/"/g, '""')}"`,
        r.attending ? 'CONFIRMED' : 'DNF',
        `"${r.relationship || 'Guest'}"`,
        r.attending ? r.total_headcount : 0,
        rAdults,
        rKids,
        `"${companionsStr.replace(/"/g, '""')}"`,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        `"${new Date(r.created_at).toLocaleString()}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `M7_Pit_Wall_Telemetry_Checkin_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PASSCODE GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-f1-ambient flex flex-col items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md double-bezel shadow-2xl"
        >
          <div className="double-bezel-inner p-6 sm:p-8">
            <div className="h-1.5 kerb-inlay-h absolute top-0 left-0 right-0" />

            <div className="text-center mt-2 mb-6">
              <M7Logo size="sm" showSubtitle={false} animated={false} className="mb-3" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E10600]/15 border border-[#E10600]/30 rounded-full text-[#FF5E5B] text-xs font-telemetry font-bold">
                <Lock size={12} /> RESTRICTED PIT WALL ACCESS
              </div>
              <h1 className="font-f1-head text-xl font-black text-white mt-2 uppercase italic">
                PIT WALL TELEMETRY PASSCODE
              </h1>
              <p className="font-telemetry text-xs text-[#8E8E98] mt-1">
                Enter encryption passcode to access live guest telemetry.
              </p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              {passcodeError && (
                <div className="p-3 bg-[#E10600]/15 border border-[#E10600] rounded-xl text-[#FF5E5B] text-xs font-telemetry">
                  {passcodeError}
                </div>
              )}

              <div>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="ENTER PASSCODE"
                    className="w-full px-4 py-3 bg-[#0F0F16] border border-white/15 focus:border-[#00D2BE] rounded-xl text-center text-white font-telemetry tracking-widest text-lg outline-none placeholder-[#555566] shadow-inner"
                    autoFocus
                  />
                  <Key size={18} className="absolute left-3.5 top-3.5 text-[#8E8E98]" />
                </div>
                <div className="text-right mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPasscode(EVENT_CONFIG.adminPasscode)}
                    className="text-[11px] font-telemetry text-[#00D2BE] hover:underline cursor-pointer"
                  >
                    Quick Fill Default ({EVENT_CONFIG.adminPasscode})
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-f1-primary text-white font-f1-head font-bold text-sm tracking-wider uppercase rounded-full cursor-pointer transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <span>AUTHENTICATE & ENTER PIT WALL</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onBackToApp}
                className="w-full py-2 text-[#8E8E98] hover:text-white font-telemetry text-xs transition-colors cursor-pointer text-center"
              >
                ← Back to Grand Prix Invitation
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // PIT WALL DASHBOARD
  return (
    <div className="min-h-[100dvh] bg-f1-ambient py-8 px-4 flex flex-col items-center select-none">
      <div className="w-full max-w-6xl z-10 space-y-6">
        {/* Top Header Bar */}
        <div className="double-bezel shadow-2xl">
          <div className="double-bezel-inner p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <M7Logo size="sm" showSubtitle={false} animated={false} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D2BE] animate-ping" />
                  <span className="font-telemetry text-xs text-[#00D2BE] font-bold tracking-wider">
                    LIVE PIT WALL TELEMETRY // MATTHEU AMARI 7TH GP
                  </span>

                  {/* Supabase Status Pill */}
                  <button
                    onClick={() => setShowDbModal(true)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-telemetry font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      rsvpService.isSupabaseConnected
                        ? 'bg-[#00D2BE]/15 text-[#00D2BE] border-[#00D2BE]/40 hover:bg-[#00D2BE]/25'
                        : 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40 hover:bg-[#FFB800]/25'
                    }`}
                    title="Configure Supabase Database"
                  >
                    <Database size={11} />
                    <span>{rsvpService.isSupabaseConnected ? 'SUPABASE CLOUD SYNCED' : 'LOCAL CACHE (CLICK TO CONNECT DB)'}</span>
                  </button>
                </div>

                <h1 className="font-f1-head text-xl sm:text-2xl font-black text-white uppercase italic mt-0.5">
                  HEADCOUNT & DRIVER GRID COMMAND CENTER
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              {/* Add VIP Driver */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-telemetry font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
                title="Add Walk-in Driver"
              >
                <Plus size={14} className="text-[#00D2BE]" />
                <span>ADD DRIVER</span>
              </button>

              {/* Sync Button */}
              <button
                onClick={fetchRsvps}
                className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-[#8E8E98] hover:text-white rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                title="Refresh Data"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>SYNC</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#00D2BE] hover:bg-[#20ebd7] text-[#0E0E14] font-telemetry font-bold text-xs rounded-full shadow-[0_0_15px_rgba(0,210,190,0.5)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>EXPORT CSV</span>
              </button>

              {/* Exit Pit Wall */}
              <button
                onClick={onBackToApp}
                className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">EXIT</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI TELEMETRY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Headcount */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><Users size={14} className="text-[#00D2BE]" /> TOTAL HEADCOUNT</span>
              <span className="text-[10px] bg-[#00D2BE]/10 text-[#00D2BE] px-2 py-0.5 rounded-full border border-[#00D2BE]/30">ATTENDING</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-f1-head text-3xl sm:text-4xl font-black text-white">{stats.totalHeadcount}</span>
              <span className="text-xs font-telemetry text-[#8E8E98]">guests</span>
            </div>
            <div className="text-[11px] text-[#8E8E98] font-telemetry mt-1">
              {stats.adultsCount} Adults • {stats.kidsCount} Kids
            </div>
          </div>

          {/* Card 2: Confirmed Primary Drivers */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00D2BE]" /> GRID SLOTS</span>
              <span className="text-[10px] bg-white/5 text-[#8E8E98] px-2 py-0.5 rounded-full">CONFIRMED</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-f1-head text-3xl sm:text-4xl font-black text-[#00D2BE]">{stats.confirmedDrivers}</span>
              <span className="text-xs font-telemetry text-[#8E8E98]">entries</span>
            </div>
            <div className="text-[11px] text-[#8E8E98] font-telemetry mt-1">
              Registered drivers
            </div>
          </div>

          {/* Card 3: Can't Attend (DNF) */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><XCircle size={14} className="text-[#FF5E5B]" /> DNF / DECLINED</span>
              <span className="text-[10px] bg-[#FF5E5B]/10 text-[#FF5E5B] px-2 py-0.5 rounded-full border border-[#FF5E5B]/30">UNAVAILABLE</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-f1-head text-3xl sm:text-4xl font-black text-[#FF5E5B]">{stats.dnfDrivers}</span>
              <span className="text-xs font-telemetry text-[#8E8E98]">guests</span>
            </div>
            <div className="text-[11px] text-[#8E8E98] font-telemetry mt-1">
              Sent birthday radio wishes
            </div>
          </div>

          {/* Card 4: Database Mode */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><Database size={14} className="text-[#FFB800]" /> SUPABASE CLOUD</span>
              <button
                onClick={() => setShowDbModal(true)}
                className="text-[10px] text-[#00D2BE] hover:underline cursor-pointer"
              >
                CONFIG
              </button>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`font-f1-head text-xl font-bold uppercase italic ${rsvpService.isSupabaseConnected ? 'text-[#00D2BE]' : 'text-[#FFB800]'}`}>
                {rsvpService.isSupabaseConnected ? 'CONNECTED' : 'LOCAL CACHE'}
              </span>
            </div>
            <div className="text-[11px] text-[#8E8E98] font-telemetry mt-1 truncate">
              {rsvpService.isSupabaseConnected ? 'Real-time database active' : 'Click Config to connect Supabase'}
            </div>
          </div>
        </div>

        {/* DRIVERS GRID TELEMETRY TABLE */}
        <div className="double-bezel shadow-2xl">
          <div className="double-bezel-inner overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-[#101018] p-1 rounded-full border border-white/10 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'all'
                      ? 'bg-[#E10600] text-white shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  ALL ({rsvps.length})
                </button>
                <button
                  onClick={() => setFilterTab('attending')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'attending'
                      ? 'bg-[#00D2BE] text-[#0E0E14] shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  CONFIRMED ({stats.confirmedDrivers})
                </button>
                <button
                  onClick={() => setFilterTab('dnf')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'dnf'
                      ? 'bg-white/[0.08] text-[#FF5E5B] border border-[#FF5E5B]/40'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  DNF ({stats.dnfDrivers})
                </button>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={15} className="absolute left-3.5 top-2.5 text-[#8E8E98]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search driver, companions..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0F0F16] border border-white/15 rounded-full text-xs font-telemetry text-white placeholder-[#555566] outline-none focus:border-[#00D2BE]"
                  />
                </div>

                <button
                  onClick={handlePurgeMockData}
                  className="px-3 py-2 bg-white/5 hover:bg-red-500/20 text-[#8E8E98] hover:text-red-400 border border-white/10 rounded-full text-xs font-telemetry cursor-pointer transition-colors whitespace-nowrap"
                  title="Remove hardcoded demo records"
                >
                  Clear Demo Data
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-telemetry text-xs">
                <thead className="bg-[#101018] text-[#8E8E98] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">DRIVER NAME</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">SEATS</th>
                    <th className="py-3 px-4">PIT CREW (+1S)</th>
                    <th className="py-3 px-4">BIRTHDAY PIT RADIO</th>
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredRsvps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#8E8E98]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users size={28} className="text-[#555566]" />
                          <p className="font-f1-head font-bold uppercase text-white">NO DRIVERS REGISTERED YET</p>
                          <p className="text-xs">Awaiting formation lap submissions or click "+ ADD DRIVER" above.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRsvps.map((record, idx) => (
                      <tr key={record.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4 text-[#8E8E98] font-bold">
                          P{idx + 1}
                        </td>

                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {record.guest_name}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {record.attending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/30 text-[10px] font-bold">
                              <CheckCircle2 size={12} /> CONFIRMED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF5E5B]/15 text-[#FF5E5B] border border-[#FF5E5B]/30 text-[10px] font-bold">
                              <XCircle size={12} /> DNF
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {record.attending ? record.total_headcount : 0}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          {record.attending && Array.isArray(record.companions) && record.companions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {record.companions.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded-full text-[10px] border bg-[#00D2BE]/10 text-[#00D2BE] border-[#00D2BE]/30 flex items-center gap-1"
                                >
                                  <UserCheck size={11} />
                                  <span>{c.fullName}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#555566] text-[10px]">Solo Driver</span>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs text-[#C5C5CE] italic text-[11px] truncate">
                          {record.message ? (
                            <span className="flex items-center gap-1">
                              <Radio size={12} className="text-[#FFB800] shrink-0" />
                              "{record.message}"
                            </span>
                          ) : (
                            <span className="text-[#555566]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[#8E8E98] text-[10px] whitespace-nowrap">
                          {new Date(record.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(record)}
                              className="p-1.5 rounded-md bg-white/5 hover:bg-[#00D2BE]/20 text-[#8E8E98] hover:text-[#00D2BE] border border-white/10 hover:border-[#00D2BE]/40 transition-colors cursor-pointer"
                              title="Edit registration details"
                            >
                              <Edit size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-[#8E8E98] hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-[#101018] px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98]">
              <span>Showing {filteredRsvps.length} of {rsvps.length} driver registrations</span>
              <span className="text-[#00D2BE] font-bold">
                {rsvpService.isSupabaseConnected ? 'CONNECTED TO SUPABASE' : 'LOCAL CACHE MODE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          MODAL 1: SUPABASE CONFIGURATION & SQL MIGRATION
          ============================================================================== */}
      <AnimatePresence>
        {showDbModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDbModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl double-bezel shadow-2xl relative my-auto"
            >
              <div className="double-bezel-inner p-6 sm:p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

                <button
                  onClick={() => setShowDbModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-[#8E8E98] hover:text-white bg-white/5 cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-2.5 mb-2">
                  <Database size={20} className="text-[#00D2BE]" />
                  <h2 className="font-f1-head text-lg sm:text-xl font-black text-white uppercase italic">
                    SUPABASE CLOUD DATABASE SETUP
                  </h2>
                </div>
                <p className="font-telemetry text-xs text-[#8E8E98] mb-4">
                  Connect your real Supabase project to replace local memory and persist guest registrations in real time.
                </p>

                {/* Status banner */}
                <div className={`p-3 rounded-xl border text-xs font-telemetry mb-4 flex items-center gap-2 ${
                  rsvpService.isSupabaseConnected
                    ? 'bg-[#00D2BE]/10 border-[#00D2BE]/40 text-[#00D2BE]'
                    : 'bg-[#FFB800]/10 border-[#FFB800]/40 text-[#FFB800]'
                }`}>
                  <Database size={15} />
                  <span>
                    Status: {rsvpService.isSupabaseConnected ? 'Connected & Synced with Supabase' : 'Not Connected (Currently using LocalStorage cache)'}
                  </span>
                </div>

                {/* Form */}
                <div className="space-y-3 font-telemetry text-xs">
                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Supabase Project URL</label>
                    <input
                      type="text"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white font-mono text-xs focus:border-[#00D2BE] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Supabase Anon / Public API Key</label>
                    <input
                      type="password"
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white font-mono text-xs focus:border-[#00D2BE] outline-none"
                    />
                  </div>

                  {dbTestResult && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      dbTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/40 text-red-400'
                    }`}>
                      {dbTestResult.message}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={isTestingDb}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-colors cursor-pointer text-center"
                    >
                      {isTestingDb ? 'Testing Connection...' : 'Test Connection'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSupabaseConfig}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-[#00D2BE] hover:bg-[#20ebd7] text-[#0E0E14] font-bold transition-colors cursor-pointer text-center"
                    >
                      Save & Connect
                    </button>
                  </div>

                  {/* Schema instructions */}
                  <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase">Database SQL Schema (Table: rsvps)</span>
                      <button
                        onClick={handleCopySql}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSql ? <Check size={12} className="text-[#00D2BE]" /> : <Copy size={12} />}
                        <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#8E8E98] leading-relaxed">
                      1. Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#00D2BE] hover:underline inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink size={10} /></a> &rarr; <strong>SQL Editor</strong>.<br />
                      2. Click <strong>Copy SQL Script</strong> above, paste it into the editor, and click <strong>Run</strong>.<br />
                      3. Copy your project URL & anon key from <strong>Project Settings &rarr; API</strong> and save above!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================================================
          MODAL 2: EDIT DRIVER RECORD
          ============================================================================== */}
      <AnimatePresence>
        {editingRecord && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingRecord(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg double-bezel shadow-2xl relative my-auto"
            >
              <div className="double-bezel-inner p-6 sm:p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

                <button
                  onClick={() => setEditingRecord(null)}
                  className="absolute top-4 right-4 p-2 rounded-full text-[#8E8E98] hover:text-white bg-white/5 cursor-pointer"
                >
                  <X size={16} />
                </button>

                <h2 className="font-f1-head text-lg sm:text-xl font-black text-white uppercase italic mb-1">
                  EDIT DRIVER REGISTRATION
                </h2>
                <p className="font-telemetry text-xs text-[#8E8E98] mb-4">
                  Update guest attendance, accompany count, or birthday pit radio message.
                </p>

                <form onSubmit={handleSaveEdit} className="space-y-4 font-telemetry text-xs">
                  {/* Name */}
                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white text-sm outline-none focus:border-[#00D2BE]"
                      required
                    />
                  </div>

                  {/* Attendance Status */}
                  <div className="flex items-center gap-4">
                    <label className="text-[#8E8E98] uppercase">Attendance Status:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditAttending(true)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          editAttending
                            ? 'bg-[#00D2BE] text-black shadow-md'
                            : 'bg-white/5 text-[#8E8E98] hover:text-white'
                        }`}
                      >
                        CONFIRMED (ATTENDING)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditAttending(false)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          !editAttending
                            ? 'bg-[#FF5E5B] text-white shadow-md'
                            : 'bg-white/5 text-[#8E8E98] hover:text-white'
                        }`}
                      >
                        DNF (CANNOT ATTEND)
                      </button>
                    </div>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Relationship</label>
                    <select
                      value={editRelationship}
                      onChange={(e) => setEditRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white text-xs outline-none focus:border-[#00D2BE]"
                    >
                      <option value="Family / Relative">Family / Relative</option>
                      <option value="Schoolmate / Friend">Schoolmate / Friend</option>
                      <option value="Ninong / Ninang">Ninong / Ninang</option>
                      <option value="VIP Guest">VIP Guest</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>

                  {/* Companions */}
                  {editAttending && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[#8E8E98] uppercase">Accompanying Guests (+1s)</label>
                        <button
                          type="button"
                          onClick={() => setEditCompanions([...editCompanions, { id: `c-${Date.now()}`, fullName: '', type: 'Adult' }])}
                          className="text-[11px] text-[#00D2BE] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} /> Add Accompany
                        </button>
                      </div>

                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {editCompanions.map((comp, idx) => (
                          <div key={comp.id || idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={comp.fullName}
                              onChange={(e) => {
                                const next = [...editCompanions];
                                next[idx].fullName = e.target.value;
                                setEditCompanions(next);
                              }}
                              placeholder={`Companion #${idx + 1}`}
                              className="flex-1 px-3 py-1.5 bg-[#12121A] border border-white/10 rounded text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => setEditCompanions(editCompanions.filter((_, i) => i !== idx))}
                              className="p-1.5 text-[#8E8E98] hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Birthday Radio Message</label>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white text-xs outline-none focus:border-[#00D2BE] resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingRecord(null)}
                      className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="flex-1 py-2.5 rounded-full btn-f1-primary text-white font-bold cursor-pointer"
                    >
                      {isSavingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================================================
          MODAL 3: ADD NEW DRIVER (MANUAL VIP WALK-IN)
          ============================================================================== */}
      <AnimatePresence>
        {showAddModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg double-bezel shadow-2xl relative my-auto"
            >
              <div className="double-bezel-inner p-6 sm:p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-[#8E8E98] hover:text-white bg-white/5 cursor-pointer"
                >
                  <X size={16} />
                </button>

                <h2 className="font-f1-head text-lg sm:text-xl font-black text-white uppercase italic mb-1">
                  MANUAL VIP GRID REGISTRATION
                </h2>
                <p className="font-telemetry text-xs text-[#8E8E98] mb-4">
                  Add an offline guest or VIP attendee directly into the database.
                </p>

                <form onSubmit={handleSaveNew} className="space-y-4 font-telemetry text-xs">
                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Driver Full Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Grandma Elena"
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white text-sm outline-none focus:border-[#00D2BE]"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-[#8E8E98] uppercase">Status:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewAttending(true)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          newAttending ? 'bg-[#00D2BE] text-black shadow-md' : 'bg-white/5 text-[#8E8E98]'
                        }`}
                      >
                        CONFIRMED
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAttending(false)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          !newAttending ? 'bg-[#FF5E5B] text-white shadow-md' : 'bg-white/5 text-[#8E8E98]'
                        }`}
                      >
                        DNF
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Relationship</label>
                    <select
                      value={newRelationship}
                      onChange={(e) => setNewRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white text-xs outline-none focus:border-[#00D2BE]"
                    >
                      <option value="Family / Relative">Family / Relative</option>
                      <option value="Schoolmate / Friend">Schoolmate / Friend</option>
                      <option value="Ninong / Ninang">Ninong / Ninang</option>
                      <option value="VIP Guest">VIP Guest</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>

                  {newAttending && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[#8E8E98] uppercase">Accompanying Guests (+1s)</label>
                        <button
                          type="button"
                          onClick={() => setNewCompanions([...newCompanions, { id: `c-${Date.now()}`, fullName: '', type: 'Adult' }])}
                          className="text-[11px] text-[#00D2BE] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} /> Add Accompany
                        </button>
                      </div>

                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {newCompanions.map((comp, idx) => (
                          <div key={comp.id || idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={comp.fullName}
                              onChange={(e) => {
                                const next = [...newCompanions];
                                next[idx].fullName = e.target.value;
                                setNewCompanions(next);
                              }}
                              placeholder={`Companion #${idx + 1} Name`}
                              className="flex-1 px-3 py-1.5 bg-[#12121A] border border-white/10 rounded text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => setNewCompanions(newCompanions.filter((_, i) => i !== idx))}
                              className="p-1.5 text-[#8E8E98] hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[#8E8E98] uppercase mb-1">Message Note (Optional)</label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Special note or birthday greeting"
                      rows={2}
                      className="w-full px-3 py-2 bg-[#12121A] border border-white/15 rounded-lg text-white text-xs outline-none focus:border-[#00D2BE] resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingNew}
                      className="flex-1 py-2.5 rounded-full btn-f1-primary text-white font-bold cursor-pointer"
                    >
                      {isSavingNew ? 'Adding...' : 'Register Driver'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
