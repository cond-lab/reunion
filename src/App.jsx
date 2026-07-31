import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Plus, Trash2, X, LogOut, Mail, ArrowLeft, Sun, Moon, Check, RotateCcw } from 'lucide-react';

/* ══ TEMA ══ */
function useTema() {
  const [tema, setTema] = useState(() => localStorage.getItem('reunion_tema') || 'light');
  useEffect(() => {
    localStorage.setItem('reunion_tema', tema);
    document.documentElement.classList.toggle('dark', tema === 'dark');
    document.body.style.background = tema === 'dark' ? '#141A22' : '#FCFCFB';
  }, [tema]);
  return [tema, () => setTema(t => (t === 'dark' ? 'light' : 'dark'))];
}

const campo =
  "w-full rounded-lg px-3.5 py-3 text-[15px] transition-all outline-none " +
  "bg-chalk text-ink placeholder-ink/30 border border-ink/10 focus:border-signal focus:bg-white " +
  "dark:bg-white/[0.04] dark:text-white dark:placeholder-white/25 dark:border-white/10 dark:focus:bg-white/[0.07]";

const etiquetaCampo = "etiqueta block mb-2 text-ink/40 dark:text-white/35";

/* ══ MARCA ══ */
function Marca({ compacta = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-2.5 h-2.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-signal" />
        <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-40" />
      </div>
      <span className={`etiqueta ${compacta ? 'text-ink/50 dark:text-white/40' : 'text-ink/60 dark:text-white/50'}`}>
        Polygon · Reunión 08:00
      </span>
    </div>
  );
}

/* ══ ACCESO ══ */
function Acceso({ toggleTema, tema }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [vista, setVista] = useState('acceso');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setCargando(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
    if (error) setError('Ese email y contraseña no coinciden. Revísalos e inténtalo otra vez.');
    setCargando(false);
  }

  async function recuperar(e) {
    e.preventDefault();
    setCargando(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) setError('No hemos podido enviar el correo. Comprueba la dirección.');
    else setEnviado(true);
    setCargando(false);
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-[#141A22] flex flex-col">
      <div className="flex items-center justify-between px-6 sm:px-10 h-16 shrink-0">
        <Marca />
        <button onClick={toggleTema} aria-label="Cambiar tema"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/5 dark:text-white/35 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
          {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-[380px]">

          <div className="mb-9">
            <div className="etiqueta text-signal mb-3">
              {vista === 'acceso' ? 'Acceso' : 'Recuperar contraseña'}
            </div>
            <h1 className="fecha-hero text-[52px] sm:text-[62px] text-ink dark:text-white">
              {vista === 'acceso' ? <>Parte<br />del día</> : <>Nueva<br />clave</>}
            </h1>
            <div className="h-px bg-ink/10 dark:bg-white/10 mt-6" />
          </div>

          {enviado ? (
            <div className="panel">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-conform/15 flex items-center justify-center shrink-0">
                  <Check size={15} className="text-conform" strokeWidth={3} />
                </div>
                <p className="text-[14px] leading-relaxed text-ink/70 dark:text-white/60 pt-1.5">
                  Correo enviado a <span className="dato text-ink dark:text-white">{email}</span>. Abre el enlace para poner una contraseña nueva.
                </p>
              </div>
              <button onClick={() => { setVista('acceso'); setEnviado(false); }}
                className="etiqueta flex items-center gap-2 text-ink/40 hover:text-signal dark:text-white/35 dark:hover:text-signal transition-colors">
                <ArrowLeft size={12} /> Volver
              </button>
            </div>
          ) : vista === 'acceso' ? (
            <form onSubmit={entrar} className="space-y-5 panel">
              <div>
                <label className={etiquetaCampo}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nombre@polygon.es" required className={campo} autoComplete="email" />
              </div>
              <div>
                <label className={etiquetaCampo}>Contraseña</label>
                <input type="password" value={clave} onChange={e => setClave(e.target.value)}
                  placeholder="••••••••" required className={campo} autoComplete="current-password" />
              </div>

              {error && (
                <div className="flex gap-2.5 text-[13px] leading-snug text-ink/70 dark:text-white/60 bg-signal/10 border-l-2 border-signal rounded-r-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <button type="submit" disabled={cargando}
                className="w-full h-12 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[15px] hover:opacity-90 disabled:opacity-40 transition-opacity active:scale-[0.99]">
                {cargando ? 'Entrando…' : 'Entrar'}
              </button>

              <button type="button" onClick={() => { setVista('recuperar'); setError(''); }}
                className="etiqueta text-ink/35 hover:text-signal dark:text-white/30 dark:hover:text-signal transition-colors">
                He olvidado la contraseña
              </button>
            </form>
          ) : (
            <form onSubmit={recuperar} className="space-y-5 panel">
              <p className="text-[14px] leading-relaxed text-ink/60 dark:text-white/50">
                Te enviamos un enlace para poner una contraseña nueva.
              </p>
              <div>
                <label className={etiquetaCampo}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nombre@polygon.es" required className={campo} autoFocus />
              </div>
              {error && (
                <div className="text-[13px] leading-snug text-ink/70 dark:text-white/60 bg-signal/10 border-l-2 border-signal rounded-r-lg px-3 py-2.5">
                  {error}
                </div>
              )}
              <button type="submit" disabled={cargando}
                className="w-full h-12 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-opacity">
                <Mail size={15} /> {cargando ? 'Enviando…' : 'Enviar enlace'}
              </button>
              <button type="button" onClick={() => { setVista('acceso'); setError(''); }}
                className="etiqueta flex items-center gap-2 text-ink/35 hover:text-signal dark:text-white/30 dark:hover:text-signal transition-colors">
                <ArrowLeft size={12} /> Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ NUEVA CONTRASEÑA ══ */
function NuevaClave() {
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    if (clave !== repetir) return setError('Las dos contraseñas no coinciden.');
    if (clave.length < 6) return setError('Usa al menos 6 caracteres.');
    setCargando(true); setError('');
    const { error } = await supabase.auth.updateUser({ password: clave });
    if (error) setError('No se ha podido guardar. Inténtalo otra vez.');
    else setListo(true);
    setCargando(false);
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-[#141A22] flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="etiqueta text-signal mb-3">Contraseña</div>
        <h1 className="fecha-hero text-[52px] text-ink dark:text-white mb-6">Nueva<br />clave</h1>
        <div className="h-px bg-ink/10 dark:bg-white/10 mb-8" />

        {listo ? (
          <div className="flex items-start gap-3 panel">
            <div className="w-8 h-8 rounded-lg bg-conform/15 flex items-center justify-center shrink-0">
              <Check size={15} className="text-conform" strokeWidth={3} />
            </div>
            <p className="text-[14px] leading-relaxed text-ink/70 dark:text-white/60 pt-1.5">
              Contraseña guardada. Ya puedes entrar con ella.
            </p>
          </div>
        ) : (
          <form onSubmit={guardar} className="space-y-5 panel">
            <div>
              <label className={etiquetaCampo}>Nueva contraseña</label>
              <input type="password" value={clave} onChange={e => setClave(e.target.value)}
                placeholder="Al menos 6 caracteres" required className={campo} autoFocus />
            </div>
            <div>
              <label className={etiquetaCampo}>Repite la contraseña</label>
              <input type="password" value={repetir} onChange={e => setRepetir(e.target.value)}
                placeholder="••••••••" required className={campo} />
            </div>
            {error && (
              <div className="text-[13px] text-ink/70 dark:text-white/60 bg-signal/10 border-l-2 border-signal rounded-r-lg px-3 py-2.5">
                {error}
              </div>
            )}
            <button type="submit" disabled={cargando}
              className="w-full h-12 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[15px] hover:opacity-90 disabled:opacity-40 transition-opacity">
              {cargando ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ══ REDACTAR PUNTO ══ */
function Redactar({ onGuardar, onCerrar }) {
  const [titulo, setTitulo] = useState('');
  const [detalle, setDetalle] = useState('');

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/50 dark:bg-black/70 backdrop-blur-[2px]" onClick={onCerrar} />

      <div className="relative w-full sm:max-w-[520px] bg-paper dark:bg-[#1B232E] rounded-t-2xl sm:rounded-xl
                      border-t sm:border border-ink/10 dark:border-white/10 shadow-2xl panel">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-signal rounded-l-xl hidden sm:block" />

        <div className="flex items-center justify-between px-6 h-14 border-b border-ink/8 dark:border-white/[0.07]">
          <span className="etiqueta text-ink/45 dark:text-white/35">Nuevo punto</span>
          <button onClick={onCerrar} aria-label="Cerrar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/35 hover:text-ink hover:bg-ink/5 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (titulo.trim()) onGuardar(titulo.trim(), detalle.trim()); }}
          className="p-6 space-y-5">
          <div>
            <label className={etiquetaCampo}>Asunto</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ej. Revisión respirador quirófano 3"
              className={campo + ' text-[16px] font-medium'} autoFocus />
          </div>
          <div>
            <label className={etiquetaCampo}>Detalle · opcional</label>
            <textarea value={detalle} onChange={e => setDetalle(e.target.value)}
              placeholder="Contexto, equipo afectado, qué hace falta decidir…"
              rows={4} className={campo + ' resize-none leading-relaxed'} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCerrar}
              className="px-5 h-11 rounded-lg text-[14px] font-medium text-ink/50 hover:text-ink hover:bg-ink/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!titulo.trim()}
              className="flex-1 h-11 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[14px] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.99]">
              Añadir al parte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ PUNTO ══ */
function Punto({ punto, esMio, indice, onResolver, onBorrar }) {
  const [abierto, setAbierto] = useState(false);
  const r = punto.resuelto;
  const detalle = punto.descripcion?.trim();
  const hora = new Date(punto.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <article
      style={{ animationDelay: `${Math.min(indice * 45, 400)}ms` }}
      className={`surge group relative rounded-lg overflow-hidden transition-colors duration-300
        ${r ? 'bg-ink/[0.02] dark:bg-white/[0.015]' : 'bg-white dark:bg-[#1B232E] shadow-[0_1px_2px_rgba(10,16,23,0.05)] dark:shadow-none'}
        border border-ink/8 dark:border-white/[0.07] hover:border-ink/15 dark:hover:border-white/15`}>

      {/* Franja de estado — la firma */}
      <button onClick={() => onResolver(punto)}
        aria-label={r ? 'Marcar como pendiente' : 'Marcar como resuelto'}
        className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 hover:w-[6px]
          ${r ? 'bg-conform' : 'bg-signal'}`} />

      <div className="pl-6 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`text-[15px] font-semibold leading-snug transition-colors
            ${r ? 'text-ink/35 dark:text-white/25 line-through decoration-1' : 'text-ink dark:text-white'}`}>
            {punto.titulo}
          </h3>

          <div className="flex items-center gap-1 shrink-0 -mt-0.5">
            <button onClick={() => onResolver(punto)}
              title={r ? 'Reabrir' : 'Resolver'}
              className={`h-7 px-2.5 rounded-md etiqueta flex items-center gap-1.5 transition-all
                ${r
                  ? 'text-conform hover:bg-conform/10'
                  : 'text-ink/40 hover:text-conform hover:bg-conform/10 dark:text-white/30'}`}>
              {r ? <><RotateCcw size={11} /> Reabrir</> : <><Check size={12} strokeWidth={3} /> Resolver</>}
            </button>
            {esMio && (
              <button onClick={() => onBorrar(punto.id)} title="Eliminar"
                className="w-7 h-7 rounded-md flex items-center justify-center text-ink/25 hover:text-red-500 hover:bg-red-500/10 dark:text-white/20 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-2.5">
          <span className="dato text-[11px] text-ink/40 dark:text-white/30">{hora}</span>
          <span className="w-1 h-1 rounded-full bg-ink/15 dark:bg-white/15" />
          <span className="dato text-[11px] text-ink/40 dark:text-white/30 truncate">
            {punto.autor.split('@')[0]}
          </span>
          {detalle && (
            <>
              <span className="w-1 h-1 rounded-full bg-ink/15 dark:bg-white/15" />
              <button onClick={() => setAbierto(v => !v)}
                className="dato text-[11px] text-signal hover:underline underline-offset-2">
                {abierto ? 'ocultar detalle' : 'ver detalle'}
              </button>
            </>
          )}
        </div>

        {abierto && detalle && (
          <p className="panel mt-3.5 pl-3 border-l border-ink/12 dark:border-white/12 text-[13.5px] leading-relaxed whitespace-pre-wrap text-ink/65 dark:text-white/55">
            {detalle}
          </p>
        )}
      </div>
    </article>
  );
}

/* ══ APP ══ */
export default function App() {
  const [tema, toggleTema] = useTema();
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [recuperando, setRecuperando] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [cargandoPuntos, setCargandoPuntos] = useState(true);
  const [redactando, setRedactando] = useState(false);
  const [filtro, setFiltro] = useState('pendientes');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSesion(data.session); setCargandoSesion(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, s) => {
      setSesion(s);
      setRecuperando(evento === 'PASSWORD_RECOVERY');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function cargar() {
    const { data } = await supabase.from('puntos').select('*').order('created_at', { ascending: true });
    if (data) setPuntos(data);
  }

  useEffect(() => {
    if (!sesion) return;
    cargar().then(() => setCargandoPuntos(false));
    const t = setInterval(cargar, 5000);
    return () => clearInterval(t);
  }, [sesion]);

  async function guardar(titulo, descripcion) {
    setRedactando(false);
    await supabase.from('puntos').insert({
      titulo, descripcion: descripcion || null, autor: sesion.user.email, resuelto: false,
    });
    cargar();
  }

  async function resolver(p) {
    setPuntos(prev => prev.map(x => (x.id === p.id ? { ...x, resuelto: !x.resuelto } : x)));
    await supabase.from('puntos').update({ resuelto: !p.resuelto }).eq('id', p.id);
  }

  async function borrar(id) {
    setPuntos(prev => prev.filter(x => x.id !== id));
    await supabase.from('puntos').delete().eq('id', id);
  }

  if (cargandoSesion) return <div className="min-h-screen bg-paper dark:bg-[#141A22]" />;
  if (recuperando) return <NuevaClave />;
  if (!sesion) return <Acceso toggleTema={toggleTema} tema={tema} />;

  const pendientes = puntos.filter(p => !p.resuelto);
  const resueltos = puntos.filter(p => p.resuelto);
  const lista = filtro === 'pendientes' ? pendientes : filtro === 'resueltos' ? resueltos : puntos;

  const hoy = new Date();
  const diaSemana = hoy.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaMes = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  const usuario = sesion.user.email;

  const filtros = [
    { id: 'pendientes', txt: 'Pendientes', n: pendientes.length },
    { id: 'resueltos',  txt: 'Resueltos',  n: resueltos.length },
    { id: 'todos',      txt: 'Todo',       n: puntos.length },
  ];

  return (
    <div className="min-h-screen bg-paper dark:bg-[#141A22] transition-colors duration-300">
      {redactando && <Redactar onGuardar={guardar} onCerrar={() => setRedactando(false)} />}

      {/* Barra superior */}
      <header className="sticky top-0 z-30 bg-paper/90 dark:bg-[#141A22]/90 backdrop-blur-md border-b border-ink/8 dark:border-white/[0.06]">
        <div className="max-w-[680px] mx-auto px-6 h-14 flex items-center justify-between">
          <Marca compacta />
          <div className="flex items-center gap-1">
            <button onClick={toggleTema} aria-label="Cambiar tema"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/35 hover:text-ink hover:bg-ink/5 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
              {tema === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="w-px h-4 bg-ink/10 dark:bg-white/10 mx-1.5" />
            <span className="dato text-[11px] text-ink/45 dark:text-white/35 hidden sm:block max-w-[150px] truncate">
              {usuario}
            </span>
            <button onClick={() => supabase.auth.signOut()} title="Salir"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/35 hover:text-red-500 hover:bg-red-500/10 dark:text-white/30 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-6 pb-32">

        {/* HÉROE: la fecha */}
        <div className="pt-12 pb-8">
          <div className="etiqueta text-signal mb-3">{diaSemana}</div>
          <h1 className="fecha-hero text-[clamp(48px,13vw,84px)] text-ink dark:text-white">
            {diaMes}
          </h1>

          <div className="flex items-center gap-5 mt-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal" />
              <span className="dato text-[12px] text-ink/60 dark:text-white/45">
                {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-conform" />
              <span className="dato text-[12px] text-ink/60 dark:text-white/45">
                {resueltos.length} resuelto{resueltos.length !== 1 ? 's' : ''}
              </span>
            </span>
          </div>
        </div>

        <div className="h-px bg-ink/10 dark:bg-white/10" />

        {/* Filtros + añadir */}
        <div className="flex items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-1">
            {filtros.map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id)}
                className={`etiqueta px-3 h-8 rounded-md flex items-center gap-1.5 transition-colors
                  ${filtro === f.id
                    ? 'bg-ink text-paper dark:bg-white/10 dark:text-white'
                    : 'text-ink/40 hover:text-ink hover:bg-ink/5 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/5'}`}>
                {f.txt}
                <span className="dato opacity-50 text-[10px]">{f.n}</span>
              </button>
            ))}
          </div>

          <button onClick={() => setRedactando(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink text-[13px] font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]">
            <Plus size={15} strokeWidth={2.5} /> Añadir punto
          </button>
        </div>

        {/* Lista */}
        {cargandoPuntos ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-[86px] rounded-lg bg-ink/[0.03] dark:bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="py-20 text-center">
            <div className="etiqueta text-ink/30 dark:text-white/25 mb-3">
              {filtro === 'resueltos' ? 'Sin resolver aún'
                : filtro === 'pendientes' && puntos.length > 0 ? 'Parte cerrado'
                : 'Parte vacío'}
            </div>
            <p className="text-[15px] text-ink/50 dark:text-white/40 max-w-[280px] mx-auto leading-relaxed">
              {filtro === 'pendientes' && puntos.length > 0
                ? 'No queda nada pendiente para la reunión de hoy.'
                : filtro === 'resueltos'
                ? 'Los puntos que marques como resueltos aparecerán aquí.'
                : 'Añade el primer punto a tratar en la reunión de mañana.'}
            </p>
            {filtro !== 'resueltos' && (
              <button onClick={() => setRedactando(true)}
                className="mt-6 h-10 px-5 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink text-[14px] font-semibold hover:opacity-90 transition-opacity">
                Añadir punto
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {lista.map((p, i) => (
              <Punto key={p.id} punto={p} indice={i} esMio={p.autor === usuario}
                onResolver={resolver} onBorrar={borrar} />
            ))}
          </div>
        )}
      </main>

      {/* Botón flotante móvil */}
      <button onClick={() => setRedactando(true)} aria-label="Añadir punto"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-ink dark:bg-signal
                   flex items-center justify-center shadow-lg shadow-ink/25 dark:shadow-signal/25
                   transition-transform active:scale-90 z-20">
        <Plus size={24} className="text-paper dark:text-ink" strokeWidth={2.5} />
      </button>
    </div>
  );
}
