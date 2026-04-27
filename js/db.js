/* ============================================================
   FlowState — IndexedDB Data Layer
   Tables: users, sessions
   ============================================================ */

const DB_NAME = 'flowstate_db';
const DB_VERSION = 1;

class FlowStateDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('user_id', 'user_id', { unique: false });
          sessionStore.createIndex('created_at', 'created_at', { unique: false });
          sessionStore.createIndex('subject', 'subject', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /* ---- User Methods ---- */

  async getOrCreateUser() {
    const tx = this.db.transaction('users', 'readonly');
    const store = tx.objectStore('users');

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = async () => {
        if (request.result.length > 0) {
          resolve(request.result[0]);
        } else {
          const user = await this.createUser();
          resolve(user);
        }
      };
    });
  }

  async createUser() {
    const tx = this.db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    const user = { total_hours: 0 };

    return new Promise((resolve) => {
      const request = store.add(user);
      request.onsuccess = () => {
        user.id = request.result;
        resolve(user);
      };
    });
  }

  async updateUserHours(userId, additionalHours) {
    const tx = this.db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');

    return new Promise((resolve) => {
      const getReq = store.get(userId);
      getReq.onsuccess = () => {
        const user = getReq.result;
        user.total_hours = (user.total_hours || 0) + additionalHours;
        const putReq = store.put(user);
        putReq.onsuccess = () => resolve(user);
      };
    });
  }

  async updateUserName(userId, name) {
    const tx = this.db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');

    return new Promise((resolve) => {
      const getReq = store.get(userId);
      getReq.onsuccess = () => {
        const user = getReq.result;
        user.name = name;
        const putReq = store.put(user);
        putReq.onsuccess = () => resolve(user);
      };
    });
  }

  async getUser(userId) {
    const tx = this.db.transaction('users', 'readonly');
    const store = tx.objectStore('users');

    return new Promise((resolve) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /* ---- Session Methods ---- */

  async saveSession(session) {
    const tx = this.db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    session.created_at = new Date().toISOString();

    return new Promise((resolve) => {
      const request = store.add(session);
      request.onsuccess = () => {
        session.id = request.result;
        resolve(session);
      };
    });
  }

  async getAllSessions(userId) {
    const tx = this.db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('user_id');

    return new Promise((resolve) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        // Sort by created_at
        const sessions = request.result.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        resolve(sessions);
      };
    });
  }

  async getSessionsLast7Days(userId) {
    const sessions = await this.getAllSessions(userId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return sessions.filter(s => new Date(s.created_at) >= sevenDaysAgo);
  }

  async getCumulativeHours(userId) {
    const sessions = await this.getAllSessions(userId);
    let cumulative = 0;
    return sessions.map(s => {
      cumulative += (s.duration_minutes || 0) / 60;
      return {
        date: s.created_at,
        hours: Math.round(cumulative * 10) / 10
      };
    });
  }

  async getSubjectBreakdown(userId) {
    const sessions = await this.getSessionsLast7Days(userId);
    const subjects = {};

    sessions.forEach(s => {
      const subject = s.subject || 'Unspecified';
      subjects[subject] = (subjects[subject] || 0) + (s.duration_minutes || 0) / 60;
    });

    return Object.entries(subjects)
      .map(([subject, hours]) => ({ subject, hours: Math.round(hours * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours);
  }
}

// Export singleton
window.flowDB = new FlowStateDB();
