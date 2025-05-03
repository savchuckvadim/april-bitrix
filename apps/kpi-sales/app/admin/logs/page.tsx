'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [textFilter, setTextFilter] = useState<string>('');

  async function loadLogs() {
    const res = await fetch('/api/admin/logs');
    const data = await res.json();
    setLogs(data.reverse()); // последние в начале
  }

  async function clearLogs() {
    await fetch('/api/admin/clear-logs', { method: 'POST' });
    loadLogs();
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    (levelFilter ? log.level === levelFilter : true) &&
    (textFilter ? (log.message + log.context).toLowerCase().includes(textFilter.toLowerCase()) : true)
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Server Logs</h1>

      <div style={{ marginBottom: '20px' }}>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="">Все уровни</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>

        <input
          type="text"
          placeholder="Поиск по сообщению"
          value={textFilter}
          onChange={(e) => setTextFilter(e.target.value)}
          style={{ marginLeft: '10px' }}
        />

        <button onClick={clearLogs} style={{ marginLeft: '10px' }}>
          🧹 Очистить
        </button>
      </div>

      <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#111', color: '#0f0', padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
        {filteredLogs.map((log, idx) => (
          <div key={idx} >
            <b className='bg-white text-indigo-700'>{log.timestamp}</b> <span className={log.level == 'error' ? 'bg-red-600' : ''}> [{log.level.toUpperCase()}]</span> <i>{log.context}</i> — {log.message}
          </div>
        ))}
      </pre>
    </div>
  );
}
