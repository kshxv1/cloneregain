import { Member, Room } from '../types';

export interface GroupsService {
  getRooms(filter: 'friends' | 'public' | 'my'): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(name: string, subject: string, isPublic: boolean, goalMin?: number): Promise<Room>;
  joinRoom(codeOrId: string, userMember: Member): Promise<Room | null>;
  leaveRoom(roomId: string, userId: string): Promise<boolean>;
  updateMemberStatus(roomId: string, userId: string, status: 'focusing' | 'break' | 'idle'): Promise<void>;
  sendCheer(roomId: string, fromName: string, emoji: string): void;
  getLeaderboard(period: 'today' | 'week' | 'all', scope: 'friends' | 'global'): Promise<Member[]>;
  onCheerReceived(callback: (cheer: { id: string; from: string; emoji: string }) => void): () => void;
}

const INITIAL_ROOMS: Room[] = [
  {
    id: 'room_mcat',
    name: 'Pre-Med & MCAT Grind',
    subject: 'Biology / Chem',
    isPublic: true,
    code: 'MCAT26',
    goalMin: 180,
    members: [
      { id: 'u_elena', name: 'Elena V.', status: 'focusing', todayMin: 142, streak: 12, avatarColor: '#5EEAD4', currentTag: 'Revision' },
      { id: 'u_marcus', name: 'Marcus Chen', status: 'focusing', todayMin: 110, streak: 8, avatarColor: '#A78BFA', currentTag: 'Study' },
      { id: 'u_sarah', name: 'Sarah K.', status: 'break', todayMin: 75, streak: 5, avatarColor: '#FBBF24', currentTag: 'Break' },
      { id: 'u_devon', name: 'Devon W.', status: 'focusing', todayMin: 95, streak: 19, avatarColor: '#4ADE80', currentTag: 'Reading' },
      { id: 'u_aisha', name: 'Aisha N.', status: 'idle', todayMin: 40, streak: 3, avatarColor: '#FB923C' },
    ]
  },
  {
    id: 'room_cs_algo',
    name: 'Algorithms & LeetCode',
    subject: 'Computer Science',
    isPublic: true,
    code: 'CODE99',
    goalMin: 120,
    members: [
      { id: 'u_zack', name: 'Zack R.', status: 'focusing', todayMin: 130, streak: 15, avatarColor: '#60A5FA', currentTag: 'Coding' },
      { id: 'u_priya', name: 'Priya M.', status: 'focusing', todayMin: 90, streak: 9, avatarColor: '#EC4899', currentTag: 'Coding' },
      { id: 'u_liam', name: 'Liam O.', status: 'break', todayMin: 65, streak: 4, avatarColor: '#34D399' },
    ]
  },
  {
    id: 'room_bar_exam',
    name: 'Law Bar Exam Sprint',
    subject: 'Law / Ethics',
    isPublic: false,
    code: 'LAW2026',
    goalMin: 240,
    members: [
      { id: 'u_clara', name: 'Clara J.', status: 'focusing', todayMin: 185, streak: 22, avatarColor: '#F472B6', currentTag: 'Revision' },
      { id: 'u_tariq', name: 'Tariq S.', status: 'focusing', todayMin: 160, streak: 14, avatarColor: '#818CF8', currentTag: 'Reading' },
    ]
  },
  {
    id: 'room_deep_flow',
    name: 'Silent Library & Deep Flow',
    subject: 'Any Subject',
    isPublic: true,
    code: 'SILENT',
    goalMin: 90,
    members: [
      { id: 'u_maya', name: 'Maya L.', status: 'focusing', todayMin: 85, streak: 7, avatarColor: '#A78BFA', currentTag: 'Study' },
      { id: 'u_lucas', name: 'Lucas P.', status: 'focusing', todayMin: 70, streak: 6, avatarColor: '#5EEAD4', currentTag: 'Writing' },
      { id: 'u_hana', name: 'Hana T.', status: 'idle', todayMin: 20, streak: 2, avatarColor: '#F87171' },
      { id: 'u_ben', name: 'Ben H.', status: 'focusing', todayMin: 105, streak: 11, avatarColor: '#FBBF24', currentTag: 'Study' },
    ]
  }
];

export class MockGroupsService implements GroupsService {
  private rooms: Room[] = [...INITIAL_ROOMS];
  private cheerListeners: ((cheer: { id: string; from: string; emoji: string }) => void)[] = [];
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startLiveSimulation();
  }

  // Ticks simulated friends: randomly flips status between focusing and break, increments focus minutes
  private startLiveSimulation() {
    if (typeof window === 'undefined') return;
    this.simulationInterval = setInterval(() => {
      this.rooms.forEach(room => {
        room.members.forEach(m => {
          if (m.id.startsWith('u_')) {
            if (m.status === 'focusing') {
              m.todayMin += 1;
              // 5% chance to take a break
              if (Math.random() < 0.05) {
                m.status = 'break';
              }
            } else if (m.status === 'break') {
              // 15% chance to get back to focusing
              if (Math.random() < 0.15) {
                m.status = 'focusing';
              }
            } else if (m.status === 'idle') {
              // 10% chance to start focusing
              if (Math.random() < 0.1) {
                m.status = 'focusing';
              }
            }
          }
        });
      });
    }, 15000); // tick every 15s for lively feel
  }

  async getRooms(filter: 'friends' | 'public' | 'my'): Promise<Room[]> {
    if (filter === 'public') {
      return this.rooms.filter(r => r.isPublic);
    }
    if (filter === 'friends') {
      return this.rooms;
    }
    // 'my'
    return this.rooms.slice(0, 2);
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.find(r => r.id === id);
  }

  async createRoom(name: string, subject: string, isPublic: boolean, goalMin?: number): Promise<Room> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      name,
      subject: subject || 'General Focus',
      isPublic,
      code,
      goalMin: goalMin || 120,
      members: []
    };
    this.rooms.unshift(newRoom);
    return newRoom;
  }

  async joinRoom(codeOrId: string, userMember: Member): Promise<Room | null> {
    const query = codeOrId.trim().toUpperCase();
    const room = this.rooms.find(r => r.id === codeOrId || r.code === query);
    if (!room) return null;

    if (!room.members.some(m => m.id === userMember.id)) {
      room.members.push(userMember);
    }
    return room;
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return false;
    room.members = room.members.filter(m => m.id !== userId);
    return true;
  }

  async updateMemberStatus(roomId: string, userId: string, status: 'focusing' | 'break' | 'idle'): Promise<void> {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const member = room.members.find(m => m.id === userId);
    if (member) {
      member.status = status;
    }
  }

  sendCheer(roomId: string, fromName: string, emoji: string) {
    const cheer = {
      id: `cheer_${Date.now()}_${Math.random()}`,
      from: fromName,
      emoji
    };
    this.cheerListeners.forEach(listener => listener(cheer));
  }

  onCheerReceived(callback: (cheer: { id: string; from: string; emoji: string }) => void): () => void {
    this.cheerListeners.push(callback);
    return () => {
      this.cheerListeners = this.cheerListeners.filter(l => l !== callback);
    };
  }

  async getLeaderboard(period: 'today' | 'week' | 'all', scope: 'friends' | 'global'): Promise<Member[]> {
    // Collect all unique members
    const memberMap = new Map<string, Member>();
    this.rooms.forEach(room => {
      room.members.forEach(m => {
        if (!memberMap.has(m.id)) {
          memberMap.set(m.id, { ...m });
        }
      });
    });

    const members = Array.from(memberMap.values());
    const mult = period === 'today' ? 1 : period === 'week' ? 5.5 : 22;

    return members
      .map(m => ({
        ...m,
        todayMin: Math.round(m.todayMin * mult)
      }))
      .sort((a, b) => b.todayMin - a.todayMin);
  }
}

export const groupsService = new MockGroupsService();
