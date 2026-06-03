import React, { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiShieldOff, FiSearch, FiAlertTriangle, FiRefreshCw, FiUserCheck, FiUserPlus } from 'react-icons/fi';

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // stores user ID of action in progress
  const [banReason, setBanReason] = useState('');
  const [selectedUserForBan, setSelectedUserForBan] = useState(null); // user obj

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      // Detect browser vs file:// protocols for dynamic API URL
      const getApiUrl = () => {
        if (window.location.protocol !== 'file:') {
          return '/api/admin/users';
        }
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        return `${base}/admin/users`;
      };

      const res = await fetch(getApiUrl(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener usuarios');
      }
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (err) {
      console.warn("Backend disconnected. Loading local mock users list:", err.message);
      // Fallback local mockup list of pilots
      const local = localStorage.getItem('local_users');
      let localList = [];
      if (local) {
        localList = JSON.parse(local);
      } else {
        localList = [
          { id: 1, nombre_usuario: "ShadowFang", email: "shadow@nexus.com", rol: "admin", baneado: false, motivo_ban: null, fecha_creacion: "2026-01-10T12:00:00Z" },
          { id: 2, nombre_usuario: "LunaMist", email: "luna@nexus.com", rol: "user", baneado: false, motivo_ban: null, fecha_creacion: "2026-02-15T15:30:00Z" },
          { id: 3, nombre_usuario: "DarkReaper", email: "reaper@nexus.com", rol: "user", baneado: true, motivo_ban: "Conducta inapropiada en el canal global.", fecha_creacion: "2026-03-01T09:15:00Z" },
          { id: 4, nombre_usuario: "BloodWraith", email: "wraith@nexus.com", rol: "user", baneado: false, motivo_ban: null, fecha_creacion: "2026-04-18T18:45:00Z" },
          { id: 5, nombre_usuario: "NightStalker", email: "stalker@nexus.com", rol: "user", baneado: false, motivo_ban: null, fecha_creacion: "2026-05-20T21:10:00Z" }
        ];
        localStorage.setItem('local_users', JSON.stringify(localList));
      }
      setUsers(localList);
      setFilteredUsers(localList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Users
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = users.filter(u => 
      u.nombre_usuario.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  // Toggle Ban Status
  const handleToggleBan = async (u) => {
    setActionLoading(u.id);
    const isBanning = !u.baneado;
    let reason = 'Violación de los términos de servicio.';
    
    if (isBanning) {
      // Use prompt
      const promptReason = window.prompt("Ingrese el motivo de la suspensión administrativa:", "Incumplimiento de normas de conducta.");
      if (promptReason === null) {
        setActionLoading(null);
        return; // user cancelled prompt
      }
      reason = promptReason || reason;
    }

    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const getApiUrl = () => {
        if (window.location.protocol !== 'file:') {
          return `/api/admin/users/${u.id}/ban`;
        }
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        return `${base}/admin/users/${u.id}/ban`;
      };

      const res = await fetch(getApiUrl(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          baneado: isBanning,
          motivo_ban: isBanning ? reason : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar suspensión');
      }

      // Local state update
      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, baneado: isBanning, motivo_ban: isBanning ? reason : null } : usr));
    } catch (err) {
      console.warn("Backend offline. Simulating ban status locally:", err.message);
      // Local storage fallback updates
      const local = JSON.parse(localStorage.getItem('local_users') || '[]');
      const updated = local.map(usr => usr.id === u.id ? { ...usr, baneado: isBanning, motivo_ban: isBanning ? reason : null } : usr);
      localStorage.setItem('local_users', JSON.stringify(updated));
      setUsers(updated);
    } finally {
      setActionLoading(null);
    }
  };

  // Change user role
  const handleChangeRole = async (u) => {
    setActionLoading(u.id);
    const newRole = u.rol === 'admin' ? 'user' : 'admin';
    const confirmMsg = u.rol === 'admin' 
      ? `¿Está seguro de remover los permisos de administrador al piloto '${u.nombre_usuario}'?`
      : `¿Está seguro de conceder privilegios de administrador al piloto '${u.nombre_usuario}'?`;
      
    if (!window.confirm(confirmMsg)) {
      setActionLoading(null);
      return;
    }

    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const getApiUrl = () => {
        if (window.location.protocol !== 'file:') {
          return `/api/admin/users/${u.id}/role`;
        }
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        return `${base}/admin/users/${u.id}/role`;
      };

      const res = await fetch(getApiUrl(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rol: newRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar rol');
      }

      // Local state update
      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, rol: newRole } : usr));
    } catch (err) {
      console.warn("Backend offline. Simulating role change locally:", err.message);
      // Local storage fallback updates
      const local = JSON.parse(localStorage.getItem('local_users') || '[]');
      const updated = local.map(usr => usr.id === u.id ? { ...usr, rol: newRole } : usr);
      localStorage.setItem('local_users', JSON.stringify(updated));
      setUsers(updated);
    } finally {
      setActionLoading(null);
    }
  };

  // Metrics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.rol === 'admin').length;
  const bannedCount = users.filter(u => u.baneado).length;
  const activeCount = totalUsers - bannedCount;

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-10 fade-in transition-all duration-500 max-w-6xl mx-auto w-full">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl text-white tracking-wide" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
            PANEL DE ADMINISTRACIÓN
          </h1>
          <p className="text-theme-muted uppercase tracking-[0.2em] text-xs font-semibold mt-1">
            Core Identity Gateway & Control de Pilotos
          </p>
        </div>
        
        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="flex items-center gap-2 border border-theme-neon/30 hover:border-theme-neon rounded-lg px-4 py-2 text-xs bg-theme-panel backdrop-blur-sm text-theme-neon font-bold font-display shadow-neon hover:shadow-neon-strong transition-all duration-300 disabled:opacity-40"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          SINCRONIZAR RED
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="glass-panel p-4 flex flex-col justify-between hover:border-theme-neon/30 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-theme-muted">Pilotos Registrados</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-white font-display leading-none">{totalUsers}</span>
            <FiUsers className="text-theme-neon" size={20} />
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between hover:border-theme-neon/30 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-theme-muted">Pilotos Activos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-theme-success font-display leading-none">{activeCount}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-theme-success shadow-[0_0_8px_var(--theme-success)]" />
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between hover:border-theme-neon/30 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-theme-danger font-semibold">Cuentas Suspendidas</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-red-500 font-display leading-none">{bannedCount}</span>
            <FiAlertTriangle className="text-red-500" size={20} />
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between hover:border-theme-neon/30 transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-theme-muted">Comando Administrativo</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-[#c084fc] font-display leading-none">{adminCount}</span>
            <FiShield className="text-[#c084fc]" size={20} />
          </div>
        </div>

      </div>

      {/* Control Area */}
      <div className="glass-panel overflow-hidden flex flex-col flex-1">
        
        {/* Search Header */}
        <div className="p-4 border-b border-theme-neon/20 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuario, correo o rol..."
              className="w-full bg-black/50 border border-theme-neon/20 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-theme-neon focus:shadow-neon transition-all"
            />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-theme-muted text-right uppercase">
            FILTRADO: {filteredUsers.length} DE {totalUsers} REGISTROS
          </span>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-x-auto min-h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-theme-muted italic">
              <FiRefreshCw size={24} className="animate-spin text-theme-neon mb-2" />
              Obteniendo communications del gateway...
            </div>
          ) : error && filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-400 p-4 text-center">
              <FiAlertTriangle size={32} className="mb-2" />
              <p className="font-bold text-sm">Error de sincronización con el servidor</p>
              <p className="text-xs text-theme-muted mt-1">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-theme-muted italic">
              Ningún piloto coincide con los criterios de búsqueda.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-theme-neon/10 bg-white/[0.02] text-xs font-bold tracking-wider text-theme-muted uppercase font-display">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Piloto</th>
                  <th className="py-4 px-6">Correo</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-center">Acciones de Comando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map(u => (
                  <tr 
                    key={u.id} 
                    className={`hover:bg-white/[0.02] transition-colors ${u.id === user?.id ? 'bg-theme-neon/5' : ''}`}
                  >
                    <td className="py-4 px-6 font-mono text-xs text-theme-muted">{u.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/60 border border-theme-neon/20 flex items-center justify-center font-bold text-theme-neon text-xs">
                          {u.nombre_usuario.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            {u.nombre_usuario}
                            {u.id === user?.id && (
                              <span className="bg-theme-neon/20 text-theme-neon text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                                Tú
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-theme-muted font-mono leading-none mt-0.5">
                            Registrado: {new Date(u.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-medium">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        u.rol === 'admin' 
                          ? 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/30 shadow-[0_0_6px_rgba(192,132,252,0.2)]' 
                          : 'bg-theme-muted/10 text-theme-muted border-theme-neon/10'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.baneado ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-500 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                            Baneado
                          </span>
                          <span className="text-[9px] text-red-400/80 max-w-[150px] truncate italic leading-tight mt-0.5" title={u.motivo_ban}>
                            {u.motivo_ban || 'Sin motivo'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-theme-success font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-theme-success shadow-[0_0_6px_#22c55e]" />
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        
                        {/* Change Role Button */}
                        <button 
                          onClick={() => handleChangeRole(u)}
                          disabled={actionLoading === u.id || u.id === user?.id}
                          className={`flex items-center gap-1 text-[11px] font-bold font-display px-3 py-1.5 rounded border transition-all ${
                            u.rol === 'admin'
                              ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500'
                              : 'border-[#c084fc]/30 text-[#c084fc] hover:bg-[#c084fc]/10 hover:border-[#c084fc]'
                          } disabled:opacity-30`}
                          title={u.rol === 'admin' ? "Degradar a Usuario Común" : "Promover a Administrador"}
                        >
                          {u.rol === 'admin' ? <FiShieldOff size={12} /> : <FiShield size={12} />}
                          {u.rol === 'admin' ? "DEGRADAR" : "PROMOVER"}
                        </button>

                        {/* Ban / Unban Button */}
                        <button 
                          onClick={() => handleToggleBan(u)}
                          disabled={actionLoading === u.id || u.id === user?.id}
                          className={`flex items-center gap-1 text-[11px] font-bold font-display px-3 py-1.5 rounded border transition-all ${
                            u.baneado
                              ? 'border-theme-success/30 text-theme-success hover:bg-theme-success/10 hover:border-theme-success shadow-neon hover:shadow-neon-strong'
                              : 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500'
                          } disabled:opacity-30`}
                        >
                          {u.baneado ? <FiUserCheck size={12} /> : <FiShieldOff size={12} />}
                          {u.baneado ? "ACTIVAR" : "BANEAR"}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
