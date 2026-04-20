'use client';
import { useState, useEffect, useRef } from 'react';

function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function Cuidador() {
  const [ubicacion, setUbicacion] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [dentroZona, setDentroZona] = useState(true);
  const [distancia, setDistancia] = useState(0);
  const [enviandoPanico, setEnviandoPanico] = useState(false);
  const [alertaEnviada, setAlertaEnviada] = useState(false);
  const [presionando, setPresionando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const alertaFueraRef = useRef(false);
  const numeroCaso = 'CG-' + Date.now().toString().slice(-6);

  useEffect(() => {
    const p = localStorage.getItem('cuidagt_familiar');
    if (p) setPerfil(JSON.parse(p));
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUbicacion({ lat: latitude, lng: longitude });
        const p2 = JSON.parse(localStorage.getItem('cuidagt_familiar') || '{}');
        if (p2.homeLat) {
          const dist = calcularDistancia(latitude, longitude, p2.homeLat, p2.homeLng);
          setDistancia(Math.round(dist));
          const dentro = dist <= (p2.radioZona || 200);
          setDentroZona(dentro);
          if (!dentro && !alertaFueraRef.current) {
            alertaFueraRef.current = true;
            enviarAlertaZona(latitude, longitude, dist, p2);
          }
          if (dentro) alertaFueraRef.current = false;
        }
      },
      (error) => console.log('GPS error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (presionando && !alertaEnviada) {
      interval = setInterval(() => {
        setProgreso(p => {
          if (p >= 100) { clearInterval(interval); enviarPanico(); return 100; }
          return p + 5;
        });
      }, 100);
    } else if (!presionando) {
      setProgreso(0);
    }
    return () => clearInterval(interval);
  }, [presionando]);

  const enviarAlertaZona = async (lat: number, lng: number, dist: number, p: any) => {
    try {
      await fetch('/api/alerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'zona_segura',
          subtipo: 'fuera_zona',
          nombre: p.nombreAdulto || 'Adulto Mayor',
          telefono: p.telefono || '',
          lat, lng,
          descripcion: `Salio de zona segura. Distancia: ${Math.round(dist)}m`,
          timestamp: new Date().toISOString(),
          contactoFamiliar: p.telefono,
        }),
      });
    } catch (e) { console.error(e); }
  };

  const enviarPanico = async () => {
    if (enviandoPanico || alertaEnviada || !ubicacion) return;
    setEnviandoPanico(true);
    try {
      const p = JSON.parse(localStorage.getItem('cuidagt_familiar') || '{}');
      await fetch('/api/alerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'panico',
          subtipo: 'panico_adulto_mayor',
          nombre: p.nombreAdulto || 'Adulto Mayor',
          telefono: p.telefono || '',
          lat: ubicacion.lat,
          lng: ubicacion.lng,
          descripcion: 'Boton de panico activado por adulto mayor',
          timestamp: new Date().toISOString(),
          contactoFamiliar: p.telefono,
          numeroCaso,
        }),
      });
      setAlertaEnviada(true);
    } catch (e) { console.error(e); }
    setEnviandoPanico(false);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: dentroZona ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' : 'linear-gradient(135deg, #991b1b, #dc2626)',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      transition: 'background 1s',
    }}>
      <div style={{maxWidth:'360px',width:'100%',textAlign:'center'}}>
        <p style={{color:'white',fontWeight:'900',fontSize:'26px',margin:'0 0 4px'}}>
          {perfil?.nombreAdulto || 'Adulto Mayor'}
        </p>
        <p style={{color:ubicacion?'#4ade80':'#fbbf24',fontSize:'14px',marginBottom:'24px',fontWeight:'700'}}>
          {ubicacion ? '📍 GPS activo — estas protegido' : '📡 Activando GPS...'}
        </p>
        <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'16px',padding:'16px',marginBottom:'32px'}}>
          <p style={{color:dentroZona?'#4ade80':'#fef08a',fontWeight:'900',fontSize:'18px',margin:'0 0 4px'}}>
            {dentroZona ? '✅ Dentro de zona segura' : '⚠️ Fuera de zona segura'}
          </p>
          {ubicacion && perfil?.homeLat && (
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'13px',margin:0}}>
              Distancia de casa: {distancia} metros
            </p>
          )}
        </div>
        {alertaEnviada && (
          <div style={{background:'rgba(74,222,128,0.2)',borderRadius:'12px',padding:'12px',marginBottom:'20px',border:'1px solid rgba(74,222,128,0.4)'}}>
            <p style={{color:'#4ade80',fontWeight:'900',fontSize:'14px',margin:0}}>✅ ¡Alerta enviada a tu familiar!</p>
          </div>
        )}
        <p style={{color:'rgba(255,255,255,0.7)',fontSize:'13px',marginBottom:'16px'}}>
          Mantén presionado el botón para pedir ayuda
        </p>
        <div style={{position:'relative',marginBottom:'24px'}}>
          <button
            onMouseDown={() => setPresionando(true)}
            onMouseUp={() => setPresionando(false)}
            onTouchStart={(e) => { e.preventDefault(); setPresionando(true); }}
            onTouchEnd={() => setPresionando(false)}
            disabled={enviandoPanico || alertaEnviada}
            style={{
              width: '200px', height: '200px', borderRadius: '50%',
              background: presionando ? 'rgba(255,255,255,0.3)' : '#FACC15',
              border: '6px solid rgba(255,255,255,0.6)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', transition: 'all 0.1s',
              transform: presionando ? 'scale(0.95)' : 'scale(1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <span style={{fontSize:'60px',marginBottom:'8px'}}>🆘</span>
            <span style={{color:'#7f1d1d',fontWeight:'900',fontSize:'16px'}}>
              {enviandoPanico ? 'Enviando...' : 'NECESITO AYUDA'}
            </span>
          </button>
          {presionando && (
            <div style={{position:'absolute',bottom:'-16px',left:'50%',transform:'translateX(-50%)',width:'200px',height:'6px',background:'rgba(255,255,255,0.2)',borderRadius:'3px',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${progreso}%`,background:'#4ade80',transition:'width 0.1s',borderRadius:'3px'}}/>
            </div>
          )}
        </div>
        {perfil?.telefono && (
          <button onClick={() => window.location.href=`tel:${perfil.telefono}`}
            style={{width:'100%',padding:'16px',background:'rgba(255,255,255,0.2)',borderRadius:'14px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:'white',marginBottom:'12px',marginTop:'16px'}}>
            📞 Llamar a mi familiar
          </button>
        )}
        <button onClick={() => window.history.back()}
          style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>
          ← Volver
        </button>
      </div>
    </main>
  );
}