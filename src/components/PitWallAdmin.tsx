import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { rsvpService, type RsvpRecord } from '../services/rsvpService';
import { EVENT_CONFIG } from '../config/eventConfig';
import { M7Logo } from './M7Logo';
import { 
  Lock, 
  Key, 
  Users, 
  Baby, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Radio, 
  PieChart,
  ArrowRight
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
      relBreakdown[r.relationship] = (relBreakdown[r.relationship] || 0) + (r.total_headcount || 1);
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

      const matchDriver = r.guest_name.toLowerCase().includes(q);
      const matchRel = r.relationship.toLowerCase().includes(q);
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
        `"${r.relationship}"`,
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
      <div className="min-h-[100dvh] bg-f1-ambient flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md double-bezel"
        >
          <div className="double-bezel-inner p-6 sm:p-8">
            <div className="h-2 kerb-inlay-h absolute top-0 left-0 right-0" />

            <div className="text-center mt-2 mb-6">
              <M7Logo size="sm" showSubtitle={false} animated={false} className="mb-3" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E10600]/15 border border-[#E10600]/30 rounded-full text-[#FF5E5B] text-xs font-telemetry font-bold">
                <Lock size={12} /> RESTRICTED PIT WALL ACCESS
              </div>
              <h1 className="font-f1-head text-xl font-black text-white mt-2 uppercase italic">
                PIT WALL TELEMETRY PASSCODE
              </h1>
              <p className="font-telemetry text-xs text-[#8E8E98] mt-1">
                Enter VIP encryption passcode to access live guest telemetry.
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
        <div className="double-bezel">
          <div className="double-bezel-inner p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <M7Logo size="sm" showSubtitle={false} animated={false} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D2BE] animate-ping" />
                  <span className="font-telemetry text-xs text-[#00D2BE] font-bold tracking-wider">
                    LIVE PIT WALL TELEMETRY // MATTHEU AMARI 7TH GP
                  </span>
                </div>
                <h1 className="font-f1-head text-xl sm:text-2xl font-black text-white uppercase italic mt-0.5">
                  HEADCOUNT & DRIVER GRID COMMAND CENTER
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={fetchRsvps}
                className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-[#8E8E98] hover:text-white rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                title="Refresh Data"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>SYNC</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#00D2BE] hover:bg-[#20ebd7] text-[#0E0E14] font-telemetry font-bold text-xs rounded-full shadow-[0_0_15px_rgba(0,210,190,0.5)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>EXPORT TO CSV</span>
              </button>

              <button
                onClick={onBackToApp}
                className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">EXIT PIT WALL</span>
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
              <span className="text-[#00D2BE] text-[10px]">ALL SEATS</span>
            </div>
            <div className="mt-3">
              <span className="font-f1-head font-black text-3xl sm:text-4xl text-white italic">
                {stats.totalHeadcount}
              </span>
              <span className="text-xs text-[#8E8E98] font-telemetry ml-2 font-bold">GUESTS</span>
            </div>
            <div className="text-[10px] font-telemetry text-[#8E8E98] mt-2 border-t border-white/[0.06] pt-2">
              Includes Drivers + all Pit Crew (+1s)
            </div>
          </div>

          {/* Card 2: Demographics */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><Baby size={14} className="text-[#FFB800]" /> DEMOGRAPHICS</span>
              <span className="text-[#FFB800] text-[10px]">CATERING</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="font-f1-head font-black text-2xl text-white italic">{stats.kidsCount}</span>
                <span className="text-[11px] text-[#FFB800] font-telemetry ml-1 font-bold">KIDS</span>
              </div>
              <span className="text-[#8E8E98] text-xs">|</span>
              <div>
                <span className="font-f1-head font-black text-2xl text-white italic">{stats.adultsCount}</span>
                <span className="text-[11px] text-[#00D2BE] font-telemetry ml-1 font-bold">ADULTS</span>
              </div>
            </div>
            <div className="text-[10px] font-telemetry text-[#8E8E98] mt-2 border-t border-white/[0.06] pt-2">
              Loot Bags & Catering Ready
            </div>
          </div>

          {/* Card 3: Grid vs DNF */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00D2BE]" /> GRID ENTRIES</span>
              <span className="text-white text-[10px]">RATIO</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="font-f1-head font-black text-2xl text-[#00D2BE] italic">{stats.confirmedDrivers}</span>
                <span className="text-[11px] text-[#8E8E98] font-telemetry ml-1 font-bold">GRID</span>
              </div>
              <span className="text-[#8E8E98] text-xs">/</span>
              <div>
                <span className="font-f1-head font-black text-2xl text-[#FF5E5B] italic">{stats.dnfDrivers}</span>
                <span className="text-[11px] text-[#8E8E98] font-telemetry ml-1 font-bold">DNF</span>
              </div>
            </div>
            <div className="text-[10px] font-telemetry text-[#8E8E98] mt-2 border-t border-white/[0.06] pt-2">
              {stats.confirmedDrivers + stats.dnfDrivers} Total Responses
            </div>
          </div>

          {/* Card 4: Relationships */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E98] text-xs font-telemetry font-bold">
              <span className="flex items-center gap-1.5"><PieChart size={14} className="text-[#E10600]" /> RELATIONSHIPS</span>
              <span className="text-[#E10600] text-[10px]">SECTORS</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-12 overflow-hidden">
              {Object.entries(stats.relBreakdown).map(([rel, count]) => (
                <span key={rel} className="px-2 py-0.5 bg-black/40 rounded text-[10px] font-telemetry text-white border border-white/10">
                  {rel}: <strong className="text-[#00D2BE]">{count}</strong>
                </span>
              ))}
            </div>
            <div className="text-[10px] font-telemetry text-[#8E8E98] mt-2 border-t border-white/[0.06] pt-2">
              Guest Paddock Allocation
            </div>
          </div>
        </div>

        {/* SEARCH, FILTERS & DRIVER ROSTER TABLE */}
        <div className="double-bezel">
          <div className="double-bezel-inner">
            {/* Table Controls */}
            <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-[#101018] p-1 rounded-full border border-white/10 w-full sm:w-auto">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-telemetry font-bold transition-all cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-[#E10600] text-white shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  ALL ({rsvps.length})
                </button>
                <button
                  onClick={() => setFilterTab('attending')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-telemetry font-bold transition-all cursor-pointer ${
                    filterTab === 'attending'
                      ? 'bg-[#00D2BE] text-[#0E0E14] shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  CONFIRMED ({stats.confirmedDrivers})
                </button>
                <button
                  onClick={() => setFilterTab('dnf')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-telemetry font-bold transition-all cursor-pointer ${
                    filterTab === 'dnf'
                      ? 'bg-white/[0.08] text-[#FF5E5B] border border-[#FF5E5B]/40'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  DNF ({stats.dnfDrivers})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3.5 top-2.5 text-[#8E8E98]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search driver, companion, note..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0F0F16] border border-white/15 rounded-full text-xs font-telemetry text-white placeholder-[#555566] outline-none focus:border-[#00D2BE]"
                />
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
                    <th className="py-3 px-4">RELATIONSHIP</th>
                    <th className="py-3 px-4">SEATS</th>
                    <th className="py-3 px-4">PIT CREW (+1S)</th>
                    <th className="py-3 px-4">BIRTHDAY PIT RADIO</th>
                    <th className="py-3 px-4">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredRsvps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#8E8E98] text-xs">
                        No telemetry records match criteria.
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

                        <td className="py-3 px-4 text-[#8E8E98] whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-black/30 border border-white/10 rounded-full text-[10px]">
                            {record.relationship}
                          </span>
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
                                  className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${
                                    c.type === 'Kid'
                                      ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
                                      : 'bg-[#00D2BE]/10 text-[#00D2BE] border-[#00D2BE]/30'
                                  }`}
                                >
                                  {c.type === 'Kid' ? <Baby size={11} /> : <UserCheck size={11} />}
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-[#101018] px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98]">
              <span>Showing {filteredRsvps.length} of {rsvps.length} driver registrations</span>
              <span className="text-[#00D2BE] font-bold">TELEMETRY ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
