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
  X,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { 
  detectConflicts, 
  calculateRecordHeadcount, 
  type DetectedConflict 
} from '../services/duplicateDetection';

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
  const [filterTab, setFilterTab] = useState<'all' | 'attending' | 'dnf' | 'conflicts'>('all');

  // FIA Stewards Duplicate Verification Modal & State
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
  const [conflictFilter, setConflictFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResolvingConflict, setIsResolvingConflict] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

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
      const validCompanions = editCompanions.filter((c) => c.fullName.trim());
      const totalHeadcount = editAttending
        ? calculateRecordHeadcount({
            ...editingRecord,
            guest_name: editName.trim(),
            attending: editAttending,
            companions: validCompanions,
          })
        : 0;

      await rsvpService.updateRsvp(editingRecord.id, {
        guest_name: editName.trim(),
        attending: editAttending,
        relationship: editRelationship,
        companions: validCompanions,
        total_headcount: totalHeadcount,
        message: editMessage.trim(),
      });
      setIsSavingEdit(false);
      setEditingRecord(null);
      showToast(`Updated driver registration for "${editName.trim()}".`);
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
      showToast(`Deleted "${record.guest_name}" from the grid.`);
      fetchRsvps();
    }
  };

  // Add New Record (Manual VIP)
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSavingNew(true);
    try {
      const validCompanions = newCompanions.filter((c) => c.fullName.trim());
      const totalHeadcount = newAttending
        ? 1 + validCompanions.filter((c) => !c.isDuplicate).length
        : 0;

      await rsvpService.submitRsvp({
        guest_name: newName.trim(),
        relationship: newRelationship,
        attending: newAttending,
        companions: validCompanions,
        total_headcount: totalHeadcount,
        message: newMessage.trim(),
      });

      setIsSavingNew(false);
      setShowAddModal(false);
      setNewName('');
      setNewCompanions([]);
      setNewMessage('');
      showToast(`Registered driver "${newName.trim()}".`);
      fetchRsvps();
    } catch (err) {
      console.error('Error adding RSVP:', err);
      setIsSavingNew(false);
    }
  };

  // Conflict Detection Engine
  const conflicts = useMemo(() => detectConflicts(rsvps), [rsvps]);
  const unresolvedConflicts = useMemo(() => conflicts.filter((c) => !c.adminVerified), [conflicts]);
  const resolvedConflicts = useMemo(() => conflicts.filter((c) => c.adminVerified), [conflicts]);
  const deduplicatedConflicts = useMemo(() => conflicts.filter((c) => c.isDeduplicated), [conflicts]);

  // Conflict Resolution: Deduplicate (Exclude from Headcount)
  const handleDeduplicateConflict = async (conflict: DetectedConflict) => {
    setIsResolvingConflict(true);
    try {
      if (conflict.type === 'driver_vs_companion' || conflict.type === 'companion_vs_companion') {
        const targetRecord = rsvps.find((r) => r.id === conflict.conflicting.recordId);
        if (!targetRecord) return;

        const updatedCompanions = (targetRecord.companions || []).map((comp) => {
          if (comp.id === conflict.conflicting.companionId) {
            return {
              ...comp,
              isDuplicate: true,
              adminVerified: true,
              duplicateOf: conflict.primary.driverName,
            };
          }
          return comp;
        });

        const netHeadcount = calculateRecordHeadcount({
          ...targetRecord,
          companions: updatedCompanions,
        });

        await rsvpService.updateRsvp(targetRecord.id, {
          companions: updatedCompanions,
          total_headcount: netHeadcount,
        });

        showToast(`DEDUPLICATED: "${conflict.canonicalName}" on ${targetRecord.guest_name}'s pass excluded from count.`);
        await fetchRsvps();
      } else if (conflict.type === 'driver_vs_driver') {
        const targetRecord = rsvps.find((r) => r.id === conflict.conflicting.recordId);
        if (!targetRecord) return;

        await rsvpService.updateRsvp(targetRecord.id, {
          isDuplicate: true,
          adminVerified: true,
          total_headcount: 0,
        });

        showToast(`DEDUPLICATED: Duplicate driver "${conflict.canonicalName}" excluded from count.`);
        await fetchRsvps();
      }
    } catch (err) {
      console.error('Error resolving duplicate conflict:', err);
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Conflict Resolution: Confirm Separate Persons (Count Both)
  const handleConfirmSeparateConflict = async (conflict: DetectedConflict) => {
    setIsResolvingConflict(true);
    try {
      if (conflict.type === 'driver_vs_companion' || conflict.type === 'companion_vs_companion') {
        const targetRecord = rsvps.find((r) => r.id === conflict.conflicting.recordId);
        if (!targetRecord) return;

        const updatedCompanions = (targetRecord.companions || []).map((comp) => {
          if (comp.id === conflict.conflicting.companionId) {
            return {
              ...comp,
              isDuplicate: false,
              adminVerified: true,
              duplicateOf: undefined,
            };
          }
          return comp;
        });

        const netHeadcount = calculateRecordHeadcount({
          ...targetRecord,
          companions: updatedCompanions,
        });

        await rsvpService.updateRsvp(targetRecord.id, {
          companions: updatedCompanions,
          total_headcount: netHeadcount,
        });

        showToast(`VERIFIED: "${conflict.canonicalName}" confirmed as separate person. Both counted.`);
        await fetchRsvps();
      } else if (conflict.type === 'driver_vs_driver') {
        const targetRecord = rsvps.find((r) => r.id === conflict.conflicting.recordId);
        if (!targetRecord) return;

        const netHeadcount = calculateRecordHeadcount({
          ...targetRecord,
          isDuplicate: false,
        });

        await rsvpService.updateRsvp(targetRecord.id, {
          isDuplicate: false,
          adminVerified: true,
          total_headcount: netHeadcount,
        });

        showToast(`VERIFIED: "${conflict.canonicalName}" confirmed as separate registration.`);
        await fetchRsvps();
      }
    } catch (err) {
      console.error('Error confirming separate conflict:', err);
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Conflict Resolution: Reset back to Pending
  const handleResetConflict = async (conflict: DetectedConflict) => {
    setIsResolvingConflict(true);
    try {
      if (conflict.type === 'driver_vs_companion' || conflict.type === 'companion_vs_companion') {
        const targetRecord = rsvps.find((r) => r.id === conflict.conflicting.recordId);
        if (!targetRecord) return;

        const updatedCompanions = (targetRecord.companions || []).map((comp) => {
          if (comp.id === conflict.conflicting.companionId) {
            return {
              ...comp,
              isDuplicate: false,
              adminVerified: false,
              duplicateOf: undefined,
            };
          }
          return comp;
        });

        const netHeadcount = calculateRecordHeadcount({
          ...targetRecord,
          companions: updatedCompanions,
        });

        await rsvpService.updateRsvp(targetRecord.id, {
          companions: updatedCompanions,
          total_headcount: netHeadcount,
        });

        showToast(`RESET: "${conflict.canonicalName}" duplicate status reset to pending.`);
        await fetchRsvps();
      } else if (conflict.type === 'driver_vs_driver') {
        const targetRecord = rsvps.find((r) => r.id === conflict.conflicting.recordId);
        if (!targetRecord) return;

        await rsvpService.updateRsvp(targetRecord.id, {
          isDuplicate: false,
          adminVerified: false,
          total_headcount: calculateRecordHeadcount(targetRecord),
        });

        showToast(`RESET: "${conflict.canonicalName}" driver duplicate reset to pending.`);
        await fetchRsvps();
      }
    } catch (err) {
      console.error('Error resetting conflict:', err);
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Stats calculation - crystal-clear transparent counting of guests, entries, and declined
  const stats = useMemo(() => {
    const totalEntries = rsvps.length;
    const attendingRecords = rsvps.filter((r) => r.attending && !r.isDuplicate);
    const dnfRecords = rsvps.filter((r) => !r.attending);

    let totalHeadcount = 0;
    let kidsCount = 0;
    let adultsCount = 0;
    let deduplicatedCount = 0;
    let totalCompanionsListed = 0;
    let driversWithCompanionsCount = 0;

    attendingRecords.forEach((r) => {
      adultsCount += 1;
      totalHeadcount += 1;

      if (Array.isArray(r.companions) && r.companions.length > 0) {
        driversWithCompanionsCount += 1;
        totalCompanionsListed += r.companions.length;

        r.companions.forEach((c) => {
          if (c.isDuplicate) {
            deduplicatedCount += 1;
            return; // Excluded from headcount!
          }
          totalHeadcount += 1;
          if (c.type === 'Kid') {
            kidsCount += 1;
          } else {
            adultsCount += 1;
          }
        });
      }
    });

    const confirmedDrivers = attendingRecords.length;
    const dnfDrivers = dnfRecords.length;
    const attendingCompanions = Math.max(0, totalHeadcount - confirmedDrivers);
    const attendanceRate = totalEntries > 0 ? Math.round((confirmedDrivers / totalEntries) * 100) : 100;

    const relBreakdown: Record<string, number> = {};
    attendingRecords.forEach((r) => {
      const rel = r.relationship || 'Guest';
      const eff = calculateRecordHeadcount(r);
      relBreakdown[rel] = (relBreakdown[rel] || 0) + eff;
    });

    return {
      totalEntries,
      totalHeadcount,
      kidsCount,
      adultsCount,
      deduplicatedCount,
      confirmedDrivers,
      dnfDrivers,
      attendingCompanions,
      totalCompanionsListed,
      driversWithCompanionsCount,
      attendanceRate,
      relBreakdown,
    };
  }, [rsvps]);

  // Set of record IDs involved in duplicate conflicts or having deduplicated companions
  const conflictRecordIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      ids.add(c.primary.recordId);
      ids.add(c.conflicting.recordId);
    });
    rsvps.forEach((r) => {
      if (r.isDuplicate || (Array.isArray(r.companions) && r.companions.some((comp) => comp.isDuplicate))) {
        ids.add(r.id);
      }
    });
    return ids;
  }, [conflicts, rsvps]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      if (filterTab === 'attending' && !r.attending) return false;
      if (filterTab === 'dnf' && r.attending) return false;
      if (filterTab === 'conflicts' && !conflictRecordIds.has(r.id)) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const matchDriver = (r.guest_name || '').toLowerCase().includes(q);
      const matchRel = (r.relationship || '').toLowerCase().includes(q);
      const matchMsg = (r.message || '').toLowerCase().includes(q);
      const matchCompanions = Array.isArray(r.companions) && r.companions.some((c) => c.fullName.toLowerCase().includes(q));

      return matchDriver || matchRel || matchMsg || matchCompanions;
    });
  }, [rsvps, filterTab, searchQuery, conflictRecordIds]);

  const filteredHeadcount = useMemo(() => {
    return filteredRsvps
      .filter((r) => r.attending && !r.isDuplicate)
      .reduce((acc, r) => acc + calculateRecordHeadcount(r), 0);
  }, [filteredRsvps]);

  const handleExportCSV = () => {
    const headers = [
      'Driver Name',
      'Status',
      'Relationship',
      'Net Headcount (Deduplicated)',
      'Adults',
      'Kids',
      'Companions (Itemized)',
      'Deduplicated Accompanies Count',
      'Pit Radio Message',
      'Date Submitted',
    ];

    const rows = rsvps.map((r) => {
      const companionsStr = Array.isArray(r.companions)
        ? r.companions
            .map((c) => `${c.fullName} (${c.type}${c.isDuplicate ? ' [DEDUPLICATED/EXCLUDED]' : ''})`)
            .join('; ')
        : '';

      const rKids = Array.isArray(r.companions)
        ? r.companions.filter((c) => c.type === 'Kid' && !c.isDuplicate).length
        : 0;
      const rAdults = r.attending && !r.isDuplicate
        ? 1 + (Array.isArray(r.companions) ? r.companions.filter((c) => c.type === 'Adult' && !c.isDuplicate).length : 0)
        : 0;
      const rDeduplicated = Array.isArray(r.companions)
        ? r.companions.filter((c) => c.isDuplicate).length
        : 0;
      const netHeadcount = calculateRecordHeadcount(r);

      return [
        `"${r.guest_name.replace(/"/g, '""')}"`,
        r.attending ? (r.isDuplicate ? 'DUPLICATE ENTRY' : 'CONFIRMED') : 'DNF',
        `"${r.relationship || 'Guest'}"`,
        netHeadcount,
        rAdults,
        rKids,
        `"${companionsStr.replace(/"/g, '""')}"`,
        rDeduplicated,
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
              {/* Duplicate Audit Station Button */}
              <button
                onClick={() => setShowConflictModal(true)}
                className={`px-3.5 py-2 rounded-lg text-xs font-telemetry font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  unresolvedConflicts.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.35)] animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
                title="Verify duplicates across drivers and accompanies"
              >
                <ShieldAlert size={14} className={unresolvedConflicts.length > 0 ? 'text-amber-400' : 'text-[#00D2BE]'} />
                <span>DUPLICATE AUDIT</span>
                {unresolvedConflicts.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-black rounded-full">
                    {unresolvedConflicts.length}
                  </span>
                )}
              </button>

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

        {/* FLOATING PIT RADIO TRANSMISSION TOAST */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="p-3 bg-[#12121A] border border-[#00D2BE]/60 text-white rounded-xl shadow-[0_0_20px_rgba(0,210,190,0.3)] flex items-center gap-3 text-xs font-telemetry"
            >
              <div className="w-2 h-2 rounded-full bg-[#00D2BE] animate-ping" />
              <Radio size={14} className="text-[#00D2BE] shrink-0" />
              <span className="font-bold flex-1">{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-[#8E8E98] hover:text-white p-1"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIA STEWARDS DUPLICATE TELEMETRY BANNER */}
        {unresolvedConflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-[#181309] to-amber-950/30 border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 shrink-0 mt-0.5 md:mt-0 shadow-inner">
                  <AlertTriangle size={22} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-telemetry font-black tracking-widest uppercase">
                      FIA STEWARDS INQUIRY
                    </span>
                    <h3 className="font-f1-head text-white text-sm sm:text-base font-black uppercase italic tracking-wide">
                      {unresolvedConflicts.length} Potential Guest Duplicate{unresolvedConflicts.length > 1 ? 's' : ''} Detected
                    </h3>
                  </div>
                  <p className="font-telemetry text-xs text-[#D5D5DF] mt-1 max-w-2xl">
                    Accompanying guests have names matching registered drivers. Review and deduplicate to ensure event catering and seat counts aren't double-charged.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConflictModal(true)}
                className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-telemetry font-black text-xs rounded-full shadow-[0_0_18px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-98"
              >
                <ShieldAlert size={15} />
                <span>VERIFY & DEDUPLICATE ({unresolvedConflicts.length})</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 4 REVAMPED KPI TELEMETRY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Attending Guests (Headcount) */}
          <div className="relative group double-bezel shadow-xl overflow-hidden">
            <div className="double-bezel-inner p-4 sm:p-5 flex flex-col justify-between h-full bg-[#12121A]/95 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D2BE] via-[#1fe2ce] to-[#00D2BE]" />
              <div>
                <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="p-1 rounded-md bg-[#00D2BE]/15 text-[#00D2BE]">
                      <Users size={14} />
                    </span>
                    TOTAL GUESTS
                  </span>
                  <span className="text-[10px] bg-[#00D2BE]/15 text-[#00D2BE] px-2 py-0.5 rounded-full border border-[#00D2BE]/30 font-bold uppercase tracking-wider">
                    ATTENDING
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-f1-head text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {stats.totalHeadcount}
                  </span>
                  <span className="text-xs font-telemetry font-bold text-[#8E8E98] uppercase">
                    Unique Guests
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-telemetry">
                  <span className="text-[#8E8E98]">Driver + Crew:</span>
                  <span className="text-white font-bold">{stats.confirmedDrivers} Drivers + {stats.attendingCompanions} Crew</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98]">
                  <span>Demographics:</span>
                  <span className="text-[#A5A5B2]">{stats.adultsCount} Adults • {stats.kidsCount} Kids</span>
                </div>
                {stats.deduplicatedCount > 0 && (
                  <div
                    onClick={() => setShowConflictModal(true)}
                    className="flex items-center gap-1 text-[10px] font-telemetry text-[#00D2BE] bg-[#00D2BE]/10 px-2 py-0.5 rounded border border-[#00D2BE]/20 cursor-pointer hover:bg-[#00D2BE]/20 transition-colors"
                    title="Click to view duplicate verification audit"
                  >
                    <ShieldCheck size={11} className="shrink-0" />
                    <span>{stats.deduplicatedCount} duplicate +1 excluded from count</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: RSVP Submissions (Entries) */}
          <div className="relative group double-bezel shadow-xl overflow-hidden">
            <div className="double-bezel-inner p-4 sm:p-5 flex flex-col justify-between h-full bg-[#12121A]/95 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/40 via-white/80 to-white/40" />
              <div>
                <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="p-1 rounded-md bg-white/10 text-white">
                      <CheckCircle2 size={14} />
                    </span>
                    RSVP ENTRIES
                  </span>
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20 font-bold uppercase tracking-wider">
                    SUBMISSIONS
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-f1-head text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {stats.totalEntries}
                  </span>
                  <span className="text-xs font-telemetry font-bold text-[#8E8E98] uppercase">
                    Total Passes
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-telemetry">
                  <span className="text-[#8E8E98]">Confirmed Ratio:</span>
                  <span className="text-[#00D2BE] font-bold">{stats.confirmedDrivers} Attending ({stats.attendanceRate}%)</span>
                </div>
                {/* Visual Ratio Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#00D2BE] rounded-full transition-all duration-500"
                    style={{ width: `${stats.attendanceRate}%` }}
                    title={`${stats.confirmedDrivers} confirmed`}
                  />
                  {stats.totalEntries > 0 && stats.dnfDrivers > 0 && (
                    <div
                      className="h-full bg-[#FF5E5B] transition-all duration-500"
                      style={{ width: `${100 - stats.attendanceRate}%` }}
                      title={`${stats.dnfDrivers} declined`}
                    />
                  )}
                </div>
                <div className="text-[10px] text-[#8E8E98] font-telemetry">
                  Primary driver registrations on grid
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Declined / DNF */}
          <div className="relative group double-bezel shadow-xl overflow-hidden">
            <div className="double-bezel-inner p-4 sm:p-5 flex flex-col justify-between h-full bg-[#12121A]/95 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5E5B] via-[#ff7875] to-[#FF5E5B]" />
              <div>
                <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="p-1 rounded-md bg-[#FF5E5B]/15 text-[#FF5E5B]">
                      <XCircle size={14} />
                    </span>
                    DECLINED
                  </span>
                  <span className="text-[10px] bg-[#FF5E5B]/15 text-[#FF5E5B] px-2 py-0.5 rounded-full border border-[#FF5E5B]/30 font-bold uppercase tracking-wider">
                    DNF
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`font-f1-head text-4xl sm:text-5xl font-black tracking-tight ${stats.dnfDrivers > 0 ? 'text-[#FF5E5B]' : 'text-white/80'}`}>
                    {stats.dnfDrivers}
                  </span>
                  <span className="text-xs font-telemetry font-bold text-[#8E8E98] uppercase">
                    Cannot Attend
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-telemetry">
                  <span className="text-[#8E8E98]">Grid Status:</span>
                  <span className={stats.dnfDrivers === 0 ? 'text-emerald-400 font-bold' : 'text-[#FF5E5B] font-bold'}>
                    {stats.dnfDrivers === 0 ? 'Full Grid Confirmed' : `${stats.dnfDrivers} Declined Pass${stats.dnfDrivers > 1 ? 'es' : ''}`}
                  </span>
                </div>
                <div className="text-[10px] text-[#8E8E98] font-telemetry">
                  {stats.dnfDrivers === 0 ? '0% drop rate • 0 regrets received' : 'Wishes recorded on birthday pit radio'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Pit Crew (+1s / Accompanying) */}
          <div className="relative group double-bezel shadow-xl overflow-hidden">
            <div className="double-bezel-inner p-4 sm:p-5 flex flex-col justify-between h-full bg-[#12121A]/95 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFB800] via-[#ffd066] to-[#FFB800]" />
              <div>
                <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="p-1 rounded-md bg-[#FFB800]/15 text-[#FFB800]">
                      <UserCheck size={14} />
                    </span>
                    PIT CREW (+1S)
                  </span>
                  <span className="text-[10px] bg-[#FFB800]/15 text-[#FFB800] px-2 py-0.5 rounded-full border border-[#FFB800]/30 font-bold uppercase tracking-wider">
                    ACCOMPANYING
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-f1-head text-4xl sm:text-5xl font-black text-[#FFB800] tracking-tight">
                    {stats.attendingCompanions}
                  </span>
                  <span className="text-xs font-telemetry font-bold text-[#8E8E98] uppercase">
                    Active +1 Passes
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-telemetry">
                  <span className="text-[#8E8E98]">Crew Distribution:</span>
                  <span className="text-white font-bold">{stats.driversWithCompanionsCount} drivers bringing +1s</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98]">
                  <span>Gross Companions:</span>
                  <span className="text-[#A5A5B2]">{stats.totalCompanionsListed} total listed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DRIVERS GRID TELEMETRY TABLE */}
        <div className="double-bezel shadow-2xl">
          <div className="double-bezel-inner overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 border-b border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#101018] p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'all'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  ALL ENTRIES ({rsvps.length})
                </button>
                <button
                  onClick={() => setFilterTab('attending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterTab === 'attending'
                      ? 'bg-[#00D2BE] text-black font-black shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  <span>CONFIRMED ({stats.confirmedDrivers})</span>
                </button>
                <button
                  onClick={() => setFilterTab('dnf')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterTab === 'dnf'
                      ? 'bg-[#FF5E5B] text-white font-black shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  <span>DECLINED ({stats.dnfDrivers})</span>
                </button>
                <button
                  onClick={() => setFilterTab('conflicts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-telemetry font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterTab === 'conflicts'
                      ? 'bg-amber-500 text-black font-black shadow-md'
                      : conflictRecordIds.size > 0
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  <AlertTriangle size={12} className={unresolvedConflicts.length > 0 ? 'animate-bounce text-amber-400' : ''} />
                  <span>DUPLICATES ({conflictRecordIds.size})</span>
                </button>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <Search size={14} className="absolute left-3.5 top-2.5 text-[#8E8E98]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search driver, companions..."
                    className="w-full pl-9 pr-8 py-2 bg-[#0F0F16] border border-white/15 rounded-xl text-xs font-telemetry text-white placeholder-[#555566] outline-none focus:border-[#00D2BE] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[#8E8E98] hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handlePurgeMockData}
                  className="px-3 py-2 bg-white/5 hover:bg-red-500/15 text-[#8E8E98] hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-telemetry cursor-pointer transition-colors whitespace-nowrap"
                  title="Remove hardcoded demo records"
                >
                  Clear Demo Data
                </button>
              </div>
            </div>

            {/* Live Filter Telemetry Header */}
            <div className="px-4 py-2 bg-[#0A0A10] border-b border-white/[0.04] flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98]">
              <span>
                Showing <strong className="text-white">{filteredRsvps.length}</strong> {filteredRsvps.length === 1 ? 'entry' : 'entries'}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </span>
              <span className="text-[#00D2BE] font-bold">
                {filteredHeadcount} Attending {filteredHeadcount === 1 ? 'Guest' : 'Guests'} in this view
              </span>
            </div>

            {/* DESKTOP TABLE VIEW (hidden on mobile, visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
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
                          <p className="font-f1-head font-bold uppercase text-white">NO DRIVERS IN THIS VIEW</p>
                          <p className="text-xs">No registrations match current filter or search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRsvps.map((record, idx) => {
                      const netSeats = calculateRecordHeadcount(record);
                      const deduplicatedInRecord = Array.isArray(record.companions)
                        ? record.companions.filter((c) => c.isDuplicate).length
                        : 0;

                      return (
                        <tr key={record.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              idx === 0 ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/40' :
                              idx === 1 ? 'bg-[#C0C0C0]/15 text-[#C0C0C0] border border-[#C0C0C0]/40' :
                              idx === 2 ? 'bg-[#CD7F32]/15 text-[#CD7F32] border border-[#CD7F32]/40' :
                              'bg-white/5 text-[#8E8E98] border border-white/10'
                            }`}>
                              P{idx + 1}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{record.guest_name}</span>
                              {record.isDuplicate && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold">
                                  DUPLICATE DRIVER
                                </span>
                              )}
                              <span className="text-[10px] text-[#8E8E98] font-normal">
                                • {record.relationship || 'Guest'}
                              </span>
                            </div>
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

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">{netSeats}</span>
                              <span className="text-[10px] text-[#8E8E98]">
                                {netSeats === 1 ? 'seat' : 'seats'}
                              </span>
                              {deduplicatedInRecord > 0 && (
                                <span
                                  className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1 rounded cursor-pointer"
                                  onClick={() => setShowConflictModal(true)}
                                  title={`${deduplicatedInRecord} companion(s) deduplicated from count`}
                                >
                                  (-{deduplicatedInRecord} dupl)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            {record.attending && Array.isArray(record.companions) && record.companions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {record.companions.map((c) => {
                                  if (c.isDuplicate) {
                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setShowConflictModal(true)}
                                        className="px-2 py-0.5 rounded-full text-[10px] border bg-amber-500/15 text-amber-300/80 border-amber-500/30 line-through flex items-center gap-1 cursor-pointer hover:bg-amber-500/25 transition-colors"
                                        title="Deduplicated: excluded from headcount to prevent double counting. Tap to inspect."
                                      >
                                        <ShieldAlert size={10} className="shrink-0 text-amber-400 no-underline" />
                                        <span>{c.fullName}</span>
                                        <span className="text-[9px] no-underline font-black text-amber-400">[EXCLUDED]</span>
                                      </button>
                                    );
                                  }

                                  const hasUnresolvedMatch = unresolvedConflicts.some(
                                    (cf) => cf.conflicting.companionId === c.id
                                  );

                                  if (hasUnresolvedMatch) {
                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setShowConflictModal(true)}
                                        className="px-2 py-0.5 rounded-full text-[10px] border bg-amber-500/25 text-amber-300 border-amber-500/70 animate-pulse flex items-center gap-1 cursor-pointer hover:bg-amber-500/40 transition-colors shadow-sm"
                                        title="Name matches a registered driver! Click to open verification."
                                      >
                                        <AlertTriangle size={10} className="shrink-0 text-amber-400" />
                                        <span>{c.fullName}</span>
                                        <span className="text-[9px] bg-amber-500 text-black px-1 rounded font-black">DUPLICATE?</span>
                                      </button>
                                    );
                                  }

                                  if (c.adminVerified) {
                                    return (
                                      <span
                                        key={c.id}
                                        className="px-2 py-0.5 rounded-full text-[10px] border bg-emerald-500/15 text-emerald-300 border-emerald-500/40 flex items-center gap-1"
                                        title="Admin verified: confirmed separate person"
                                      >
                                        <ShieldCheck size={11} className="shrink-0 text-emerald-400" />
                                        <span>{c.fullName}</span>
                                      </span>
                                    );
                                  }

                                  return (
                                    <span
                                      key={c.id}
                                      className="px-2 py-0.5 rounded-full text-[10px] border bg-[#00D2BE]/10 text-[#00D2BE] border-[#00D2BE]/30 flex items-center gap-1"
                                    >
                                      <UserCheck size={11} />
                                      <span>{c.fullName}</span>
                                      <span className="text-[9px] text-[#00D2BE]/70">({c.type})</span>
                                    </span>
                                  );
                                })}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* RESPONSIVE MOBILE CARD VIEW (visible on mobile, hidden on md+) */}
            <div className="md:hidden divide-y divide-white/[0.06] p-3 space-y-3">
              {filteredRsvps.length === 0 ? (
                <div className="py-10 text-center text-[#8E8E98]">
                  <Users size={28} className="text-[#555566] mx-auto mb-2" />
                  <p className="font-f1-head font-bold uppercase text-white">NO DRIVERS FOUND</p>
                  <p className="text-xs">No registrations match current criteria.</p>
                </div>
              ) : (
                filteredRsvps.map((record, idx) => {
                  const netSeats = calculateRecordHeadcount(record);
                  const deduplicatedInRecord = Array.isArray(record.companions)
                    ? record.companions.filter((c) => c.isDuplicate).length
                    : 0;

                  return (
                    <div
                      key={record.id}
                      className="p-3.5 rounded-xl bg-[#0E0E16] border border-white/[0.08] space-y-2.5 pt-3"
                    >
                      {/* Card Header: Position, Driver Name, Status, Seats */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-telemetry font-bold ${
                            idx === 0 ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/40' :
                            idx === 1 ? 'bg-[#C0C0C0]/15 text-[#C0C0C0] border border-[#C0C0C0]/40' :
                            idx === 2 ? 'bg-[#CD7F32]/15 text-[#CD7F32] border border-[#CD7F32]/40' :
                            'bg-white/5 text-[#8E8E98] border border-white/10'
                          }`}>
                            P{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                              <span>{record.guest_name}</span>
                              {record.isDuplicate && (
                                <span className="px-1 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] border border-red-500/40">
                                  DUPLICATE
                                </span>
                              )}
                            </h4>
                            <span className="text-[11px] font-telemetry text-[#8E8E98]">
                              {record.relationship || 'Guest'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {record.attending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/30 text-[10px] font-bold">
                              <CheckCircle2 size={11} /> CONFIRMED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF5E5B]/15 text-[#FF5E5B] border border-[#FF5E5B]/30 text-[10px] font-bold">
                              <XCircle size={11} /> DNF
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white text-xs font-telemetry font-bold">
                            {netSeats} {netSeats === 1 ? 'seat' : 'seats'}
                            {deduplicatedInRecord > 0 && (
                              <span className="text-amber-400 ml-1 text-[10px]">(-{deduplicatedInRecord})</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Companions Pill Strip (if any) */}
                      {record.attending && Array.isArray(record.companions) && record.companions.length > 0 && (
                        <div className="pt-2 border-t border-white/[0.06]">
                          <div className="text-[10px] uppercase font-bold text-[#8E8E98] mb-1">
                            Pit Crew (+1s):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {record.companions.map((c) => {
                              if (c.isDuplicate) {
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setShowConflictModal(true)}
                                    className="px-2 py-0.5 rounded-full text-[10px] border bg-amber-500/15 text-amber-300/80 border-amber-500/30 line-through flex items-center gap-1 cursor-pointer"
                                  >
                                    <ShieldAlert size={10} className="shrink-0 text-amber-400" />
                                    <span>{c.fullName} [EXCLUDED]</span>
                                  </button>
                                );
                              }
                              return (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded-full text-[10px] border bg-[#00D2BE]/10 text-[#00D2BE] border-[#00D2BE]/30 flex items-center gap-1"
                                >
                                  <UserCheck size={10} />
                                  <span>{c.fullName} ({c.type})</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Radio message (if any) */}
                      {record.message && (
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-[#C5C5CE] italic flex items-center gap-1.5">
                          <Radio size={12} className="text-[#FFB800] shrink-0" />
                          <span className="truncate">"{record.message}"</span>
                        </div>
                      )}

                      {/* Footer: Date & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-telemetry text-[#8E8E98]">
                        <span>{new Date(record.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#00D2BE]/20 text-[#8E8E98] hover:text-[#00D2BE] border border-white/10 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record)}
                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-red-500/20 text-[#8E8E98] hover:text-red-400 border border-white/10 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Footer */}
            <div className="bg-[#101018] px-4 py-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-telemetry text-[#8E8E98]">
              <span>
                Showing {filteredRsvps.length} of {rsvps.length} entries ({filteredHeadcount} attending guests)
              </span>
              <span className="text-[#00D2BE] font-bold">
                {rsvpService.isSupabaseConnected ? 'CONNECTED TO SUPABASE CLOUD' : 'LOCAL CACHE MODE'}
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
          MODAL: FIA STEWARDS DUPLICATE VERIFICATION & DEDUPLICATION COMMAND
          ============================================================================== */}
      <AnimatePresence>
        {showConflictModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowConflictModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl double-bezel shadow-2xl relative my-auto"
            >
              <div className="double-bezel-inner p-5 sm:p-7 max-h-[92vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

                <button
                  onClick={() => setShowConflictModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-[#8E8E98] hover:text-white bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4 pt-1 pr-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0">
                      <ShieldAlert size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-telemetry font-black tracking-widest uppercase">
                          FIA STEWARDS
                        </span>
                        <span className="text-[11px] font-telemetry text-[#8E8E98]">
                          DUPLICATE HEADCOUNT AUDIT
                        </span>
                      </div>
                      <h2 className="font-f1-head text-lg sm:text-xl font-black text-white uppercase italic tracking-wide mt-0.5">
                        GUEST DEDUPLICATION STATION
                      </h2>
                      <p className="font-telemetry text-xs text-[#8E8E98] mt-0.5">
                        Reconcile +1 accompanying guests who also registered as primary drivers to ensure exact catering counts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Streamlined Filter & Telemetry Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-[#101018] rounded-lg border border-white/10 w-fit">
                    <button
                      type="button"
                      onClick={() => setConflictFilter('all')}
                      className={`px-3 py-1 rounded-md text-xs font-telemetry font-bold transition-all cursor-pointer ${
                        conflictFilter === 'all'
                          ? 'bg-white/20 text-white'
                          : 'text-[#8E8E98] hover:text-white'
                      }`}
                    >
                      ALL ({conflicts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConflictFilter('pending')}
                      className={`px-3 py-1 rounded-md text-xs font-telemetry font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        conflictFilter === 'pending'
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-amber-400/80 hover:text-amber-300'
                      }`}
                    >
                      {unresolvedConflicts.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      )}
                      <span>PENDING ({unresolvedConflicts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConflictFilter('resolved')}
                      className={`px-3 py-1 rounded-md text-xs font-telemetry font-bold transition-all cursor-pointer ${
                        conflictFilter === 'resolved'
                          ? 'bg-[#00D2BE] text-black font-black'
                          : 'text-[#8E8E98] hover:text-white'
                      }`}
                    >
                      RESOLVED ({resolvedConflicts.length})
                    </button>
                  </div>

                  {/* Saved Seats Pill */}
                  {deduplicatedConflicts.length > 0 && (
                    <div className="flex items-center gap-1.5 font-telemetry text-xs text-[#00D2BE] bg-[#00D2BE]/10 border border-[#00D2BE]/25 px-2.5 py-1 rounded-md self-start sm:self-auto">
                      <CheckCircle2 size={13} />
                      <span>{deduplicatedConflicts.length} duplicate seat{deduplicatedConflicts.length > 1 ? 's' : ''} removed</span>
                    </div>
                  )}
                </div>

                {/* List of Conflicts */}
                <div className="space-y-3">
                  {conflicts
                    .filter((c) => {
                      if (conflictFilter === 'pending') return !c.adminVerified;
                      if (conflictFilter === 'resolved') return c.adminVerified;
                      return true;
                    })
                    .map((conflict) => {
                      return (
                        <div
                          key={conflict.id}
                          className={`p-4 rounded-xl border transition-all ${
                            !conflict.adminVerified
                              ? 'bg-[#15120c] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                              : conflict.isDeduplicated
                              ? 'bg-[#0f1414] border-[#00D2BE]/30'
                              : 'bg-[#101410] border-emerald-500/30'
                          }`}
                        >
                          {/* Top: Name & Verification State */}
                          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  !conflict.adminVerified
                                    ? 'bg-amber-400 animate-ping'
                                    : conflict.isDeduplicated
                                    ? 'bg-[#00D2BE]'
                                    : 'bg-emerald-400'
                                }`}
                              />
                              <h3 className="font-f1-head text-base sm:text-lg font-black text-white uppercase italic tracking-wide truncate">
                                {conflict.canonicalName}
                              </h3>
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-telemetry font-bold uppercase bg-white/5 text-[#8E8E98] border border-white/10">
                                {conflict.type === 'driver_vs_companion'
                                  ? 'Driver ↔ Companion Overlap'
                                  : conflict.type === 'companion_vs_companion'
                                  ? 'Dual Companion Overlap'
                                  : 'Duplicate Driver'}
                              </span>
                            </div>

                            <div>
                              {!conflict.adminVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-telemetry font-bold">
                                  <AlertTriangle size={11} />
                                  <span>NEEDS AUDIT</span>
                                </span>
                              ) : conflict.isDeduplicated ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/40 text-[10px] font-telemetry font-bold">
                                  <ShieldCheck size={11} />
                                  <span>DEDUPLICATED (1 SEAT)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-telemetry font-bold">
                                  <Users size={11} />
                                  <span>COUNTED AS 2 SEATS</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Relationship Link (Clean horizontal flow instead of nested cards) */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/30 p-3 rounded-lg border border-white/[0.06] font-telemetry text-xs mb-3">
                            {/* Source 1: Primary Registration */}
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-[#8E8E98] uppercase tracking-wider mb-0.5">
                                PRIMARY REGISTRATION
                              </div>
                              <div className="text-white font-bold truncate">
                                {conflict.primary.driverName}
                              </div>
                              <div className="text-[11px] text-[#A5A5B2] truncate">
                                {conflict.primary.relationship || 'Guest'} • Registered Driver
                              </div>
                            </div>

                            {/* Center Divider / Link Indicator */}
                            <div className="flex sm:flex-col items-center justify-center gap-1 text-[#8E8E98] shrink-0 sm:px-3">
                              <div className="hidden sm:block w-px h-2.5 bg-white/10" />
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-bold border border-white/10 text-[#A5A5B2] uppercase tracking-wider">
                                MATCHES
                              </span>
                              <div className="hidden sm:block w-px h-2.5 bg-white/10" />
                            </div>

                            {/* Source 2: Accompany Pass */}
                            <div className="flex-1 min-w-0 sm:text-right">
                              <div className="text-[10px] font-bold text-[#8E8E98] uppercase tracking-wider mb-0.5">
                                ACCOMPANY PASS (+1)
                              </div>
                              <div className="text-white font-bold truncate">
                                Ticket of <span className="text-[#00D2BE]">{conflict.conflicting.driverName}</span>
                              </div>
                              <div className="text-[11px] text-[#A5A5B2] truncate">
                                {conflict.conflicting.companionType || 'Adult'} Companion
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
                            <div className="text-[11px] font-telemetry text-[#8E8E98]">
                              {!conflict.adminVerified ? (
                                <span className="text-amber-300/90">
                                  Currently double-counted (2 seats). Deduplicate to count as 1 seat:
                                </span>
                              ) : conflict.isDeduplicated ? (
                                <span className="text-[#00D2BE]">
                                  ✓ Deduplicated: Excluded from {conflict.conflicting.driverName}'s pass.
                                </span>
                              ) : (
                                <span className="text-emerald-400">
                                  ✓ Verified: Counted as two separate individuals with same name.
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0 w-full sm:w-auto">
                              {!conflict.adminVerified ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isResolvingConflict}
                                    onClick={() => handleDeduplicateConflict(conflict)}
                                    className="flex-1 sm:flex-none px-3.5 py-1.5 bg-[#00D2BE] hover:bg-[#1fe2ce] text-black font-telemetry font-bold text-xs rounded-full cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,210,190,0.35)] disabled:opacity-50"
                                  >
                                    <ShieldCheck size={13} />
                                    <span>SAME PERSON (EXCLUDE +1)</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isResolvingConflict}
                                    onClick={() => handleConfirmSeparateConflict(conflict)}
                                    className="flex-1 sm:flex-none px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-telemetry font-bold text-xs rounded-full cursor-pointer flex items-center justify-center gap-1.5 transition-all border border-white/15 disabled:opacity-50"
                                  >
                                    <Users size={13} />
                                    <span>COUNT BOTH (+2)</span>
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={isResolvingConflict}
                                    onClick={() =>
                                      conflict.isDeduplicated
                                        ? handleConfirmSeparateConflict(conflict)
                                        : handleDeduplicateConflict(conflict)
                                    }
                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-telemetry rounded-full cursor-pointer transition-colors border border-white/15"
                                  >
                                    Switch to {conflict.isDeduplicated ? 'Count Both' : 'Deduplicate'}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isResolvingConflict}
                                    onClick={() => handleResetConflict(conflict)}
                                    className="px-2.5 py-1 text-[#8E8E98] hover:text-white text-xs font-telemetry cursor-pointer transition-colors"
                                  >
                                    Reset
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {conflicts.filter((c) => {
                    if (conflictFilter === 'pending') return !c.adminVerified;
                    if (conflictFilter === 'resolved') return c.adminVerified;
                    return true;
                  }).length === 0 && (
                    <div className="py-12 text-center text-[#8E8E98] bg-[#101018] rounded-xl border border-white/[0.06] p-6">
                      <ShieldCheck size={36} className="text-[#00D2BE] mx-auto mb-2 opacity-80" />
                      <h4 className="font-f1-head font-bold uppercase text-white text-base">
                        {conflictFilter === 'pending'
                          ? 'ZERO PENDING CONFLICTS'
                          : 'NO RECORDS FOUND'}
                      </h4>
                      <p className="font-telemetry text-xs text-[#8E8E98] max-w-md mx-auto mt-1">
                        {conflictFilter === 'pending'
                          ? 'All detected names have been verified and accounted for. Guest headcount is accurate.'
                          : 'No duplicate detections in this view.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================================================
          MODAL 3: EDIT DRIVER RECORD
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

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {editCompanions.map((comp, idx) => (
                          <div key={comp.id || idx} className="p-2.5 bg-[#12121A] border border-white/10 rounded-lg space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={comp.fullName}
                                onChange={(e) => {
                                  const next = [...editCompanions];
                                  next[idx].fullName = e.target.value;
                                  setEditCompanions(next);
                                }}
                                placeholder={`Companion #${idx + 1}`}
                                className="flex-1 px-3 py-1.5 bg-[#0F0F16] border border-white/10 rounded text-xs text-white"
                              />
                              <select
                                value={comp.type || 'Adult'}
                                onChange={(e) => {
                                  const next = [...editCompanions];
                                  next[idx].type = e.target.value as 'Adult' | 'Kid';
                                  setEditCompanions(next);
                                }}
                                className="px-2 py-1.5 bg-[#0F0F16] border border-white/10 rounded text-xs text-white"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Kid">Kid</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setEditCompanions(editCompanions.filter((_, i) => i !== idx))}
                                className="p-1.5 text-[#8E8E98] hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <label className="flex items-center gap-2 text-[11px] text-[#8E8E98] cursor-pointer hover:text-white select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(comp.isDuplicate)}
                                onChange={(e) => {
                                  const next = [...editCompanions];
                                  next[idx].isDuplicate = e.target.checked;
                                  next[idx].adminVerified = true;
                                  setEditCompanions(next);
                                }}
                                className="accent-[#00D2BE] rounded cursor-pointer"
                              />
                              <span className={comp.isDuplicate ? 'text-amber-400 font-bold' : ''}>
                                Exclude as duplicate (already has an RSVP)
                              </span>
                            </label>
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

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {newCompanions.map((comp, idx) => (
                          <div key={comp.id || idx} className="p-2.5 bg-[#12121A] border border-white/10 rounded-lg space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={comp.fullName}
                                onChange={(e) => {
                                  const next = [...newCompanions];
                                  next[idx].fullName = e.target.value;
                                  setNewCompanions(next);
                                }}
                                placeholder={`Companion #${idx + 1} Name`}
                                className="flex-1 px-3 py-1.5 bg-[#0F0F16] border border-white/10 rounded text-xs text-white"
                              />
                              <select
                                value={comp.type || 'Adult'}
                                onChange={(e) => {
                                  const next = [...newCompanions];
                                  next[idx].type = e.target.value as 'Adult' | 'Kid';
                                  setNewCompanions(next);
                                }}
                                className="px-2 py-1.5 bg-[#0F0F16] border border-white/10 rounded text-xs text-white"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Kid">Kid</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setNewCompanions(newCompanions.filter((_, i) => i !== idx))}
                                className="p-1.5 text-[#8E8E98] hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <label className="flex items-center gap-2 text-[11px] text-[#8E8E98] cursor-pointer hover:text-white select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(comp.isDuplicate)}
                                onChange={(e) => {
                                  const next = [...newCompanions];
                                  next[idx].isDuplicate = e.target.checked;
                                  next[idx].adminVerified = true;
                                  setNewCompanions(next);
                                }}
                                className="accent-[#00D2BE] rounded cursor-pointer"
                              />
                              <span className={comp.isDuplicate ? 'text-amber-400 font-bold' : ''}>
                                Exclude as duplicate (already registered on another pass)
                              </span>
                            </label>
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
