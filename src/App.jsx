import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAlta } from './supabase';
import { Plus, Trash2, X, LogOut, Mail, ArrowLeft, Sun, Moon, Check, RotateCcw, Send, MessageSquare, MinusCircle, UserPlus, Shield, Copy } from 'lucide-react';

/* ═══ Pon aquí tu email. Solo esta cuenta ve el panel de administración ═══ */
const ADMIN = 'r.almela@es.polygon.eu';

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

const nombreDe = email => email.split('@')[0];

function horaDe(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function fechaCorta(iso) {
  const d = new Date(iso);
  const hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  if (mismoDia) return horaDe(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' · ' + horaDe(iso);
}

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
                className="etiqueta flex items-center gap-2 text-ink/40 hover:text-signal dark:text-white/35 transition-colors">
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
                <div className="text-[13px] leading-snug text-ink/70 dark:text-white/60 bg-signal/10 border-l-2 border-signal rounded-r-lg px-3 py-2.5">
                  {error}
                </div>
              )}
              <button type="submit" disabled={cargando}
                className="w-full h-12 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[15px] hover:opacity-90 disabled:opacity-40 transition-opacity active:scale-[0.99]">
                {cargando ? 'Entrando…' : 'Entrar'}
              </button>
              <button type="button" onClick={() => { setVista('recuperar'); setError(''); }}
                className="etiqueta text-ink/35 hover:text-signal dark:text-white/30 transition-colors">
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
                <div className="text-[13px] text-ink/70 dark:text-white/60 bg-signal/10 border-l-2 border-signal rounded-r-lg px-3 py-2.5">
                  {error}
                </div>
              )}
              <button type="submit" disabled={cargando}
                className="w-full h-12 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-opacity">
                <Mail size={15} /> {cargando ? 'Enviando…' : 'Enviar enlace'}
              </button>
              <button type="button" onClick={() => { setVista('acceso'); setError(''); }}
                className="etiqueta flex items-center gap-2 text-ink/35 hover:text-signal dark:text-white/30 transition-colors">
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
      <div className="absolute inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onCerrar} />
      <div className="relative w-full sm:max-w-[520px] bg-paper dark:bg-[#1B232E] rounded-t-2xl sm:rounded-xl
                      border-t sm:border border-ink/10 dark:border-white/10 shadow-2xl panel overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-signal hidden sm:block" />
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
              className="flex-1 h-11 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[14px] hover:opacity-90 disabled:opacity-30 transition-opacity active:scale-[0.99]">
              Añadir al parte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ FICHA DEL PUNTO ══ */
function Ficha({ punto, comentarios, usuario, esAdmin, onCerrar, onComentar, onSinNovedades, onResolver, onBorrar }) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef(null);
  const r = punto.resuelto;
  const detalle = punto.descripcion?.trim();

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'nearest' });
  }, [comentarios.length]);

  async function enviar(e) {
    e?.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    await onComentar(punto.id, texto.trim());
    setTexto('');
    setEnviando(false);
  }

  async function sinNovedades() {
    setEnviando(true);
    await onSinNovedades(punto.id);
    setEnviando(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onCerrar} />

      <div className="relative w-full sm:max-w-[560px] max-h-[92vh] sm:max-h-[85vh] flex flex-col
                      bg-paper dark:bg-[#1B232E] rounded-t-2xl sm:rounded-xl
                      border-t sm:border border-ink/10 dark:border-white/10 shadow-2xl panel overflow-hidden">

        <div className={`absolute left-0 top-0 bottom-0 w-[3px] hidden sm:block ${r ? 'bg-conform' : 'bg-signal'}`} />

        {/* Cabecera */}
        <div className="shrink-0 border-b border-ink/8 dark:border-white/[0.07]">
          <div className="flex items-center justify-between px-6 h-14">
            <span className={`etiqueta ${r ? 'text-conform' : 'text-signal'}`}>
              {r ? 'Resuelto' : 'Pendiente'}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => onResolver(punto)}
                className={`h-8 px-3 rounded-md etiqueta flex items-center gap-1.5 transition-colors
                  ${r ? 'text-conform hover:bg-conform/10' : 'text-ink/45 hover:text-conform hover:bg-conform/10 dark:text-white/35'}`}>
                {r ? <><RotateCcw size={11} /> Reabrir</> : <><Check size={12} strokeWidth={3} /> Resolver</>}
              </button>
              {(punto.autor === usuario || esAdmin) && (
                <button onClick={() => { onBorrar(punto.id); onCerrar(); }} title="Eliminar punto"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-ink/30 hover:text-red-500 hover:bg-red-500/10 dark:text-white/25 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={onCerrar} aria-label="Cerrar"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/35 hover:text-ink hover:bg-ink/5 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className={`text-[19px] font-bold leading-snug ${r ? 'text-ink/45 dark:text-white/30' : 'text-ink dark:text-white'}`}>
            {punto.titulo}
          </h2>
          <div className="flex items-center gap-2.5 mt-2">
            <span className="dato text-[11px] text-ink/40 dark:text-white/30">{nombreDe(punto.autor)}</span>
            <span className="w-1 h-1 rounded-full bg-ink/15 dark:bg-white/15" />
            <span className="dato text-[11px] text-ink/40 dark:text-white/30">{fechaCorta(punto.created_at)}</span>
          </div>

          {detalle && (
            <p className="mt-4 pl-3.5 border-l-2 border-ink/12 dark:border-white/12 text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink/70 dark:text-white/60">
              {detalle}
            </p>
          )}

          {/* Seguimiento */}
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="etiqueta text-ink/40 dark:text-white/30">Seguimiento</span>
              <span className="flex-1 h-px bg-ink/8 dark:bg-white/8" />
              {comentarios.length > 0 && (
                <span className="dato text-[10px] text-ink/30 dark:text-white/25">{comentarios.length}</span>
              )}
            </div>

            {comentarios.length === 0 ? (
              <p className="text-[13.5px] text-ink/35 dark:text-white/25 leading-relaxed">
                Sin anotaciones todavía. Escribe abajo cómo va el asunto.
              </p>
            ) : (
              <div className="space-y-3.5">
                {comentarios.map(c => c.sin_novedades ? (
                  <div key={c.id} className="flex items-center gap-2.5 py-0.5">
                    <MinusCircle size={13} className="text-ink/25 dark:text-white/20 shrink-0" />
                    <span className="dato text-[11.5px] text-ink/35 dark:text-white/25">
                      {nombreDe(c.autor)} · sin novedades · {fechaCorta(c.created_at)}
                    </span>
                  </div>
                ) : (
                  <div key={c.id} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-[11px] font-bold
                      ${c.autor === usuario ? 'bg-signal/20 text-signal' : 'bg-ink/8 text-ink/50 dark:bg-white/10 dark:text-white/50'}`}>
                      {c.autor[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-semibold text-ink/80 dark:text-white/75">{nombreDe(c.autor)}</span>
                        <span className="dato text-[10.5px] text-ink/35 dark:text-white/25">{fechaCorta(c.created_at)}</span>
                      </div>
                      <p className="text-[14px] leading-relaxed text-ink/70 dark:text-white/60 whitespace-pre-wrap mt-0.5">
                        {c.texto}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={finRef} />
              </div>
            )}
          </div>
        </div>

        {/* Redactar comentario */}
        <div className="shrink-0 border-t border-ink/8 dark:border-white/[0.07] p-4 bg-chalk/50 dark:bg-black/20">
          <form onSubmit={enviar} className="flex items-end gap-2">
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              placeholder="Añade una anotación…"
              rows={1}
              className={campo + ' resize-none py-2.5 text-[14px] min-h-[42px] max-h-28'}
            />
            <button type="submit" disabled={!texto.trim() || enviando} aria-label="Enviar"
              className="shrink-0 w-[42px] h-[42px] rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink flex items-center justify-center hover:opacity-90 disabled:opacity-25 transition-opacity active:scale-95">
              <Send size={15} />
            </button>
          </form>
          <button onClick={sinNovedades} disabled={enviando}
            className="etiqueta mt-2.5 flex items-center gap-1.5 text-ink/35 hover:text-ink/60 dark:text-white/25 dark:hover:text-white/50 transition-colors disabled:opacity-40">
            <MinusCircle size={12} /> Marcar sin novedades
          </button>
        </div>
      </div>
    </div>
  );
}


/* ══ ALTA DE USUARIO (solo admin) ══ */
function AltaUsuario({ onCerrar }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [creado, setCreado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);

  function generar() {
    const abc = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    setClave(Array.from({ length: 10 }, () => abc[Math.floor(Math.random() * abc.length)]).join(''));
  }

  async function crear(e) {
    e.preventDefault();
    setCargando(true); setError('');
    const { data, error } = await supabaseAlta.auth.signUp({ email: email.trim(), password: clave });
    if (error) {
      setError(error.message.includes('already') || error.message.includes('registered')
        ? 'Ese email ya tiene cuenta.'
        : 'No se ha podido crear la cuenta. Revisa el email y que la contraseña tenga al menos 6 caracteres.');
    } else if (data?.user) {
      setCreado({ email: email.trim(), clave });
    }
    setCargando(false);
  }

  function copiar() {
    navigator.clipboard.writeText(`Acceso al parte diario\nUsuario: ${creado.email}\nContraseña: ${creado.clave}\n${window.location.origin + window.location.pathname}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onCerrar} />
      <div className="relative w-full sm:max-w-[460px] bg-paper dark:bg-[#1B232E] rounded-t-2xl sm:rounded-xl
                      border-t sm:border border-ink/10 dark:border-white/10 shadow-2xl panel overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ink dark:bg-white/40 hidden sm:block" />

        <div className="flex items-center justify-between px-6 h-14 border-b border-ink/8 dark:border-white/[0.07]">
          <span className="etiqueta text-ink/45 dark:text-white/35 flex items-center gap-2">
            <Shield size={12} /> Alta de usuario
          </span>
          <button onClick={onCerrar} aria-label="Cerrar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/35 hover:text-ink hover:bg-ink/5 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {creado ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-conform/15 flex items-center justify-center shrink-0">
                <Check size={15} className="text-conform" strokeWidth={3} />
              </div>
              <p className="text-[14px] leading-relaxed text-ink/70 dark:text-white/60 pt-1.5">
                Cuenta creada. Pásale estos datos para que pueda entrar.
              </p>
            </div>

            <div className="rounded-lg bg-chalk dark:bg-white/[0.04] border border-ink/8 dark:border-white/10 p-4 space-y-2.5">
              <div className="flex justify-between gap-3">
                <span className="etiqueta text-ink/40 dark:text-white/30">Usuario</span>
                <span className="dato text-[12.5px] text-ink dark:text-white break-all text-right">{creado.email}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="etiqueta text-ink/40 dark:text-white/30">Contraseña</span>
                <span className="dato text-[12.5px] text-ink dark:text-white">{creado.clave}</span>
              </div>
            </div>

            <button onClick={copiar}
              className="w-full h-11 rounded-lg border border-ink/12 dark:border-white/12 text-[14px] font-medium text-ink/70 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 flex items-center justify-center gap-2 transition-colors">
              <Copy size={14} /> {copiado ? 'Copiado' : 'Copiar datos de acceso'}
            </button>

            <button onClick={() => { setCreado(null); setEmail(''); setClave(''); }}
              className="etiqueta text-ink/35 hover:text-signal dark:text-white/25 transition-colors">
              Dar de alta a otro
            </button>
          </div>
        ) : (
          <form onSubmit={crear} className="p-6 space-y-5">
            <div>
              <label className={etiquetaCampo}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nombre@polygon.es" required className={campo} autoFocus />
            </div>
            <div>
              <label className={etiquetaCampo}>Contraseña temporal</label>
              <div className="flex gap-2">
                <input type="text" value={clave} onChange={e => setClave(e.target.value)}
                  placeholder="Al menos 6 caracteres" required minLength={6} className={campo + ' dato'} />
                <button type="button" onClick={generar}
                  className="shrink-0 px-3 rounded-lg border border-ink/12 dark:border-white/12 etiqueta text-ink/50 dark:text-white/40 hover:bg-ink/5 dark:hover:bg-white/5 transition-colors">
                  Generar
                </button>
              </div>
              <p className="text-[12px] text-ink/40 dark:text-white/30 mt-2 leading-relaxed">
                Podrá cambiarla luego desde «He olvidado la contraseña».
              </p>
            </div>

            {error && (
              <div className="text-[13px] leading-snug text-ink/70 dark:text-white/60 bg-signal/10 border-l-2 border-signal rounded-r-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onCerrar}
                className="px-5 h-11 rounded-lg text-[14px] font-medium text-ink/50 hover:text-ink hover:bg-ink/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={cargando || !email.trim() || clave.length < 6}
                className="flex-1 h-11 rounded-lg bg-ink text-paper dark:bg-signal dark:text-ink font-semibold text-[14px] hover:opacity-90 disabled:opacity-30 transition-opacity active:scale-[0.99]">
                {cargando ? 'Creando…' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ══ TARJETA ══ */
function Punto({ punto, puedeBorrar, indice, nuevos, totalComentarios, onAbrir, onResolver, onBorrar }) {
  const r = punto.resuelto;

  return (
    <article
      onClick={() => onAbrir(punto)}
      style={{ animationDelay: `${Math.min(indice * 45, 400)}ms` }}
      className={`surge group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200
        ${r ? 'bg-ink/[0.02] dark:bg-white/[0.015]' : 'bg-white dark:bg-[#1B232E] shadow-[0_1px_2px_rgba(28,37,48,0.06)] dark:shadow-none'}
        border border-ink/8 dark:border-white/[0.07] hover:border-ink/20 dark:hover:border-white/20 hover:shadow-[0_2px_8px_rgba(28,37,48,0.08)] dark:hover:shadow-none`}>

      <span className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 group-hover:w-[5px]
        ${r ? 'bg-conform' : 'bg-signal'}`} />

      <div className="pl-6 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`text-[15px] font-semibold leading-snug transition-colors
            ${r ? 'text-ink/35 dark:text-white/25 line-through decoration-1' : 'text-ink dark:text-white'}`}>
            {punto.titulo}
          </h3>

          <div className="flex items-center gap-1 shrink-0 -mt-0.5" onClick={e => e.stopPropagation()}>
            {nuevos > 0 && (
              <span className="dato h-[19px] min-w-[19px] px-1.5 rounded-full bg-signal text-white text-[10px] font-semibold flex items-center justify-center mr-0.5">
                {nuevos}
              </span>
            )}
            <button onClick={() => onResolver(punto)} title={r ? 'Reabrir' : 'Resolver'}
              className={`h-7 px-2.5 rounded-md etiqueta flex items-center gap-1.5 transition-all
                ${r ? 'text-conform hover:bg-conform/10' : 'text-ink/40 hover:text-conform hover:bg-conform/10 dark:text-white/30'}`}>
              {r ? <><RotateCcw size={11} /> Reabrir</> : <><Check size={12} strokeWidth={3} /> Resolver</>}
            </button>
            {puedeBorrar && (
              <button onClick={() => onBorrar(punto.id)} title="Eliminar"
                className="w-7 h-7 rounded-md flex items-center justify-center text-ink/25 hover:text-red-500 hover:bg-red-500/10 dark:text-white/20 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-2.5">
          <span className="dato text-[11px] text-ink/40 dark:text-white/30">{horaDe(punto.created_at)}</span>
          <span className="w-1 h-1 rounded-full bg-ink/15 dark:bg-white/15" />
          <span className="dato text-[11px] text-ink/40 dark:text-white/30 truncate">{nombreDe(punto.autor)}</span>
          {totalComentarios > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-ink/15 dark:bg-white/15" />
              <span className="dato text-[11px] text-ink/40 dark:text-white/30 flex items-center gap-1">
                <MessageSquare size={10} /> {totalComentarios}
              </span>
            </>
          )}
        </div>
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
  const [comentarios, setComentarios] = useState([]);
  const [lecturas, setLecturas] = useState({});
  const [cargandoPuntos, setCargandoPuntos] = useState(true);

  const [redactando, setRedactando] = useState(false);
  const [abierto, setAbierto] = useState(null);
  const [filtro, setFiltro] = useState('pendientes');
  const [dandoAlta, setDandoAlta] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSesion(data.session); setCargandoSesion(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, s) => {
      setSesion(s);
      setRecuperando(evento === 'PASSWORD_RECOVERY');
    });
    return () => subscription.unsubscribe();
  }, []);

  const usuario = sesion?.user?.email;
  const esAdmin = usuario === ADMIN;

  async function cargar() {
    if (!usuario) return;
    const [p, c, l] = await Promise.all([
      supabase.from('puntos').select('*').order('created_at', { ascending: true }),
      supabase.from('comentarios').select('*').order('created_at', { ascending: true }),
      supabase.from('lecturas').select('*').eq('usuario', usuario),
    ]);
    if (p.data) setPuntos(p.data);
    if (c.data) setComentarios(c.data);
    if (l.data) setLecturas(Object.fromEntries(l.data.map(x => [x.punto_id, x.visto_en])));
  }

  useEffect(() => {
    if (!sesion) return;
    cargar().then(() => setCargandoPuntos(false));
    const t = setInterval(cargar, 5000);
    return () => clearInterval(t);
  }, [sesion]);

  async function guardarPunto(titulo, descripcion) {
    setRedactando(false);
    await supabase.from('puntos').insert({
      titulo, descripcion: descripcion || null, autor: usuario, resuelto: false,
    });
    cargar();
  }

  async function resolver(p) {
    setPuntos(prev => prev.map(x => (x.id === p.id ? { ...x, resuelto: !x.resuelto } : x)));
    setAbierto(a => (a && a.id === p.id ? { ...a, resuelto: !a.resuelto } : a));
    await supabase.from('puntos').update({ resuelto: !p.resuelto }).eq('id', p.id);
  }

  async function borrar(id) {
    setPuntos(prev => prev.filter(x => x.id !== id));
    await supabase.from('puntos').delete().eq('id', id);
  }

  async function marcarVisto(puntoId) {
    const ahora = new Date().toISOString();
    setLecturas(prev => ({ ...prev, [puntoId]: ahora }));
    await supabase.from('lecturas').upsert(
      { usuario, punto_id: puntoId, visto_en: ahora },
      { onConflict: 'usuario,punto_id' }
    );
  }

  function abrirFicha(punto) {
    setAbierto(punto);
    marcarVisto(punto.id);
  }

  function cerrarFicha() {
    if (abierto) marcarVisto(abierto.id);
    setAbierto(null);
  }

  async function comentar(puntoId, texto) {
    await supabase.from('comentarios').insert({
      punto_id: puntoId, texto, autor: usuario, sin_novedades: false,
    });
    await marcarVisto(puntoId);
    cargar();
  }

  async function sinNovedades(puntoId) {
    await supabase.from('comentarios').insert({
      punto_id: puntoId, texto: 'Sin novedades', autor: usuario, sin_novedades: true,
    });
    await marcarVisto(puntoId);
    cargar();
  }

  if (cargandoSesion) return <div className="min-h-screen bg-paper dark:bg-[#141A22]" />;
  if (recuperando) return <NuevaClave />;
  if (!sesion) return <Acceso toggleTema={toggleTema} tema={tema} />;

  // Comentarios agrupados
  const porPunto = {};
  for (const c of comentarios) (porPunto[c.punto_id] ||= []).push(c);

  const nuevosDe = puntoId => {
    const visto = lecturas[puntoId];
    return (porPunto[puntoId] || []).filter(c =>
      !c.sin_novedades &&
      c.autor !== usuario &&
      (!visto || new Date(c.created_at) > new Date(visto))
    ).length;
  };

  const pendientes = puntos.filter(p => !p.resuelto);
  const resueltos = puntos.filter(p => p.resuelto);
  const lista = filtro === 'pendientes' ? pendientes : filtro === 'resueltos' ? resueltos : puntos;
  const totalNuevos = puntos.reduce((n, p) => n + nuevosDe(p.id), 0);

  const hoy = new Date();
  const diaSemana = hoy.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaMes = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  const filtros = [
    { id: 'pendientes', txt: 'Pendientes', n: pendientes.length },
    { id: 'resueltos',  txt: 'Resueltos',  n: resueltos.length },
    { id: 'todos',      txt: 'Todo',       n: puntos.length },
  ];

  const fichaActual = abierto ? (puntos.find(p => p.id === abierto.id) || abierto) : null;

  return (
    <div className="min-h-screen bg-paper dark:bg-[#141A22] transition-colors duration-300">
      {redactando && <Redactar onGuardar={guardarPunto} onCerrar={() => setRedactando(false)} />}
      {dandoAlta && <AltaUsuario onCerrar={() => setDandoAlta(false)} />}
      {fichaActual && (
        <Ficha
          punto={fichaActual}
          comentarios={porPunto[fichaActual.id] || []}
          usuario={usuario}
          esAdmin={esAdmin}
          onCerrar={cerrarFicha}
          onComentar={comentar}
          onSinNovedades={sinNovedades}
          onResolver={resolver}
          onBorrar={borrar}
        />
      )}

      <header className="sticky top-0 z-30 bg-paper/90 dark:bg-[#141A22]/90 backdrop-blur-md border-b border-ink/8 dark:border-white/[0.06]">
        <div className="max-w-[680px] mx-auto px-6 h-14 flex items-center justify-between">
          <Marca compacta />
          <div className="flex items-center gap-1">
            {totalNuevos > 0 && (
              <span className="dato h-[19px] min-w-[19px] px-1.5 rounded-full bg-signal text-white text-[10px] font-semibold flex items-center justify-center mr-1.5">
                {totalNuevos}
              </span>
            )}
            {esAdmin && (
              <button onClick={() => setDandoAlta(true)} title="Dar de alta usuario"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/35 hover:text-signal hover:bg-signal/10 dark:text-white/30 transition-colors">
                <UserPlus size={15} />
              </button>
            )}
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
        <div className="pt-12 pb-8">
          <div className="etiqueta text-signal mb-3">{diaSemana}</div>
          <h1 className="fecha-hero text-[clamp(48px,13vw,84px)] text-ink dark:text-white">{diaMes}</h1>
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
                : 'Añade el primer punto a tratar en la reunión.'}
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
              <Punto key={p.id} punto={p} indice={i} puedeBorrar={p.autor === usuario || esAdmin}
                nuevos={nuevosDe(p.id)}
                totalComentarios={(porPunto[p.id] || []).length}
                onAbrir={abrirFicha} onResolver={resolver} onBorrar={borrar} />
            ))}
          </div>
        )}
      </main>

      <button onClick={() => setRedactando(true)} aria-label="Añadir punto"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-ink dark:bg-signal
                   flex items-center justify-center shadow-lg shadow-ink/25 dark:shadow-signal/25
                   transition-transform active:scale-90 z-20">
        <Plus size={24} className="text-paper dark:text-ink" strokeWidth={2.5} />
      </button>
    </div>
  );
}
