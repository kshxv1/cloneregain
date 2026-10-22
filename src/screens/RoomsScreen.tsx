import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  Flame,
  Trophy,
  ArrowRight,
  Share2,
  LogOut,
  Sparkles,
  ShieldAlert,
  Play,
  Pause,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Member, Room } from '../types';
import { groupsService } from '../services/GroupsService';
import { nativeBridge } from '../services/NativeBridge';

export const RoomsScreen: React.FC = () => {
  const { profile, todayFocusedMinutes, setShowStartSessionModal } = useApp();

  const [filter, setFilter] = useState<'friends' | 'public' | 'my'>('public');
  const [subTab, setSubTab] = useState<'rooms' | 'leaderboard'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  // Leaderboard state
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'today' | 'week' | 'all'>('today');
  const [leaderboardScope, setLeaderboardScope] = useState<'friends' | 'global'>('global');
  const [leaderboardData, setLeaderboardData] = useState<Member[]>([]);

  // Create room modal state
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');
  const [newRoomPublic, setNewRoomPublic] = useState(true);
  const [newRoomGoal, setNewRoomGoal] = useState(120);

  // Floating cheers
  const [floatingCheers, setFloatingCheers] = useState<{ id: string; emoji: string; from: string }[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch rooms
  useEffect(() => {
    groupsService.getRooms(filter).then(setRooms);
  }, [filter, activeRoom]);

  // Fetch leaderboard
  useEffect(() => {
    if (subTab === 'leaderboard') {
      groupsService.getLeaderboard(leaderboardPeriod, leaderboardScope).then(data => {
        // Inject current user
        const userMember: Member = {
          id: 'u_current_user',
          name: `${profile.name} (You)`,
          status: 'focusing',
          todayMin: todayFocusedMinutes,
          streak: profile.streak,
          avatarColor: profile.avatarColor,
        };
        const combined = [userMember, ...data.filter(m => m.id !== 'u_current_user')].sort((a, b) => b.todayMin - a.todayMin);
        setLeaderboardData(combined);
      });
    }
  }, [subTab, leaderboardPeriod, leaderboardScope, todayFocusedMinutes, profile]);

  // Listen to incoming cheers
  useEffect(() => {
    const unsubscribe = groupsService.onCheerReceived(cheer => {
      setFloatingCheers(prev => [...prev.slice(-4), cheer]);
      setTimeout(() => {
        setFloatingCheers(prev => prev.filter(c => c.id !== cheer.id));
      }, 3500);
    });
    return unsubscribe;
  }, []);

  const handleJoin = async (room: Room) => {
    const userMember: Member = {
      id: 'u_current_user',
      name: profile.name || 'You',
      status: 'idle',
      todayMin: todayFocusedMinutes,
      streak: profile.streak,
      avatarColor: profile.avatarColor,
      joinedAt: Date.now(),
    };
    const joined = await groupsService.joinRoom(room.id, userMember);
    if (joined) {
      setActiveRoom(joined);
      nativeBridge.triggerHaptic('success');
    }
  };

  const handleLeaveRoom = async () => {
    if (activeRoom) {
      await groupsService.leaveRoom(activeRoom.id, 'u_current_user');
      setActiveRoom(null);
      nativeBridge.triggerHaptic('medium');
    }
  };

  const handleSendCheer = (emoji: string) => {
    if (!activeRoom) return;
    groupsService.sendCheer(activeRoom.id, profile.name || 'You', emoji);
    nativeBridge.triggerHaptic('light');
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const room = await groupsService.createRoom(newRoomName.trim(), newRoomSubject.trim(), newRoomPublic, newRoomGoal);
    setIsCreatingRoom(false);
    setNewRoomName('');
    setNewRoomSubject('');
    handleJoin(room);
  };

  const copyRoomCode = () => {
    if (!activeRoom) return;
    navigator.clipboard?.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ----------------------------------------------------
  // ROOM DETAIL VIEW (When inside an active room)
  // ----------------------------------------------------
  if (activeRoom) {
    const currentUserMember = activeRoom.members.find(m => m.id === 'u_current_user');
    const isUserFocusing = currentUserMember?.status === 'focusing';
    const totalRoomMinutes = activeRoom.members.reduce((sum, m) => sum + m.todayMin, 0);

    return (
      <div className="min-h-screen pb-32 pt-5 px-5 max-w-md mx-auto select-none space-y-5 animate-in fade-in duration-200">
        {/* Floating cheers visualizer */}
        <div className="fixed top-20 right-6 z-40 pointer-events-none flex flex-col gap-2 items-end">
          {floatingCheers.map(c => (
            <div
              key={c.id}
              className="bg-[#1C2333]/90 border border-[var(--color-primary)]/40 px-3 py-1.5 rounded-full text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300"
            >
              <span className="text-base">{c.emoji}</span>
              <span className="text-white font-medium">{c.from} cheered!</span>
            </div>
          ))}
        </div>

        {/* Room Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl font-bold font-display text-[#F2F5FA]">
              {activeRoom.name}
            </h2>
            <p className="text-xs text-[#8B95AD]">
              {activeRoom.subject} • Code: <button onClick={copyRoomCode} className="text-[var(--color-primary)] font-mono hover:underline">{activeRoom.code}</button>
              {copiedCode && <span className="text-emerald-400 ml-1">Copied!</span>}
            </p>
          </div>

          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141925] border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 active:scale-95 transition-all"
          >
            <LogOut size={14} />
            <span>Leave</span>
          </button>
        </div>

        {/* Room Progress Banner */}
        <div className="bg-[#141925] border border-[#273049] rounded-[24px] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8B95AD] block font-medium">Collective Room Stillness</span>
            <div className="text-2xl font-bold font-display text-[#F2F5FA]">
              {Math.floor(totalRoomMinutes / 60)}h {totalRoomMinutes % 60}m
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#8B95AD] block font-medium">Daily Target</span>
            <span className="text-sm font-bold text-[var(--color-primary)] font-display">
              {activeRoom.goalMin ? `${Math.round(activeRoom.goalMin / 60)}h/person` : 'No Limit'}
            </span>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#F2F5FA] uppercase tracking-wider">
              Study Pod ({activeRoom.members.length})
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              {activeRoom.members.filter(m => m.status === 'focusing').length} Focusing now
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {activeRoom.members.map(member => {
              const isFocusing = member.status === 'focusing';
              const isBreak = member.status === 'break';

              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-28 ${
                    isFocusing
                      ? 'bg-[#1C2333]/90 border-emerald-500/40 shadow-sm'
                      : isBreak
                      ? 'bg-[#1C2333]/40 border-amber-500/30'
                      : 'bg-[#141925] border-[#273049]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full font-bold text-xs text-neutral-950 flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#F2F5FA] block truncate max-w-[85px]">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-[#8B95AD] flex items-center gap-0.5">
                          <Flame size={10} className="text-amber-400" />
                          {member.streak}d
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isFocusing
                          ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]'
                          : isBreak
                          ? 'bg-amber-400'
                          : 'bg-[#8B95AD]/40'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B95AD]">
                      {isFocusing ? (member.currentTag || 'Focusing') : isBreak ? 'Break' : 'Idle'}
                    </span>
                    <span className="text-sm font-bold font-display text-[#F2F5FA]">
                      {member.todayMin}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emoji Cheers Toolbar */}
        <div className="bg-[#141925] border border-[#273049] rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs text-[#8B95AD] font-medium">Send cheer:</span>
          <div className="flex gap-2">
            {['👏', '🔥', '💧', '🧠', '⚡'].map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSendCheer(emoji)}
                className="w-9 h-9 rounded-full bg-[#1C2333] hover:bg-[#273049] flex items-center justify-center text-lg active:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA: Start Your Timer with Room */}
        <div className="pt-2">
          <button
            onClick={() => setShowStartSessionModal(true)}
            className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-sm rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Play size={18} fill="currentColor" />
            <span>Start Session in this Room</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ROOMS DIRECTORY & LEADERBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="min-h-screen pb-32 pt-5 px-5 max-w-md mx-auto select-none space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#F2F5FA]">
            Study Rooms
          </h2>
          <p className="text-xs text-[#8B95AD]">
            Stay accountable with live synchronous study pods
          </p>
        </div>

        <button
          onClick={() => setIsCreatingRoom(true)}
          className="w-10 h-10 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 flex items-center justify-center shadow-md active:scale-95 transition-transform"
          aria-label="Create Room"
        >
          <Plus size={20} strokeWidth={2.8} />
        </button>
      </div>

      {/* Tabs: Pods | Leaderboard */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#141925] border border-[#273049] rounded-2xl">
        <button
          onClick={() => setSubTab('rooms')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            subTab === 'rooms'
              ? 'bg-[#1C2333] text-[#F2F5FA] shadow-sm font-bold'
              : 'text-[#8B95AD] hover:text-white'
          }`}
        >
          Active Pods
        </button>
        <button
          onClick={() => setSubTab('leaderboard')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            subTab === 'leaderboard'
              ? 'bg-[#1C2333] text-[#F2F5FA] shadow-sm font-bold'
              : 'text-[#8B95AD] hover:text-white'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* ================= ACTIVE PODS LIST ================= */}
      {subTab === 'rooms' && (
        <div className="space-y-4">
          {/* Filters: Friends, Public, My rooms */}
          <div className="flex gap-2">
            {(['public', 'friends', 'my'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs capitalize font-medium transition-colors ${
                  filter === f
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold'
                    : 'bg-[#141925] text-[#8B95AD] border border-[#273049] hover:text-white'
                }`}
              >
                {f === 'my' ? 'My Pods' : f}
              </button>
            ))}
          </div>

          {/* Rooms list */}
          <div className="space-y-3">
            {rooms.map(room => {
              const focusingCount = room.members.filter(m => m.status === 'focusing').length;

              return (
                <div
                  key={room.id}
                  className="bg-[#141925] border border-[#273049] rounded-[24px] p-5 space-y-3 hover:border-[#273049]/90 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-[#F2F5FA]">
                        {room.name}
                      </h4>
                      <p className="text-xs text-[#8B95AD]">
                        {room.subject}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {focusingCount} focusing
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Avatars pile */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {room.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-950 border-2 border-[#141925]"
                          style={{ backgroundColor: m.avatarColor }}
                          title={m.name}
                        >
                          {m.name.charAt(0)}
                        </div>
                      ))}
                      {room.members.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-[#1C2333] border-2 border-[#141925] flex items-center justify-center text-[9px] text-[#8B95AD]">
                          +{room.members.length - 4}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoin(room)}
                      className="px-4 py-2 rounded-full bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 active:scale-95 transition-transform flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Join Room</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= LEADERBOARD ================= */}
      {subTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex justify-between items-center">
            {/* Scope */}
            <div className="flex gap-1.5">
              {(['global', 'friends'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setLeaderboardScope(s)}
                  className={`px-3 py-1 rounded-full text-xs capitalize ${
                    leaderboardScope === s
                      ? 'bg-[#1C2333] text-[#F2F5FA] font-bold border border-[#273049]'
                      : 'text-[#8B95AD] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Period */}
            <div className="flex gap-1">
              {(['today', 'week', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setLeaderboardPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize ${
                    leaderboardPeriod === p
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold'
                      : 'text-[#8B95AD]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Ranking list */}
          <div className="bg-[#141925] border border-[#273049] rounded-[24px] divide-y divide-[#273049]/40 overflow-hidden">
            {leaderboardData.map((member, index) => {
              const isYou = member.id === 'u_current_user';
              const rank = index + 1;

              return (
                <div
                  key={member.id}
                  className={`p-3.5 flex items-center justify-between ${
                    isYou ? 'bg-[var(--color-primary)]/10 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center text-xs font-display font-bold ${
                        rank === 1 ? 'text-amber-400 text-sm' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-[#8B95AD]'
                      }`}
                    >
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>

                    <div
                      className="w-9 h-9 rounded-full font-bold text-xs text-neutral-950 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0)}
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-[#F2F5FA] block">
                        {member.name}
                      </span>
                      <span className="text-[10px] text-[#8B95AD] flex items-center gap-1">
                        <Flame size={10} className="text-amber-400" />
                        {member.streak} day streak
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-display text-[#F2F5FA] block">
                      {Math.floor(member.todayMin / 60)}h {member.todayMin % 60}m
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      {member.status === 'focusing' ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {isCreatingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-[#141925] border border-[#273049] rounded-3xl p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold font-display text-[#F2F5FA]">
              Create Study Pod
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8B95AD]">Pod Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g. Organic Chem Cram"
                className="w-full bg-[#1C2333] border border-[#273049] rounded-xl px-3 py-2 text-xs text-[#F2F5FA] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8B95AD]">Subject / Focus</label>
              <input
                type="text"
                value={newRoomSubject}
                onChange={(e) => setNewRoomSubject(e.target.value)}
                placeholder="e.g. MCAT Prep"
                className="w-full bg-[#1C2333] border border-[#273049] rounded-xl px-3 py-2 text-xs text-[#F2F5FA] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#F2F5FA]">Public Pod</span>
              <input
                type="checkbox"
                checked={newRoomPublic}
                onChange={(e) => setNewRoomPublic(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCreatingRoom(false)}
                className="flex-1 py-2.5 rounded-full bg-[#1C2333] text-xs font-semibold text-[#F2F5FA]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 py-2.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] text-xs font-bold shadow-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
