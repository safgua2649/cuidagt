'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APIProvider, Map, Marker, Circle } from '@vis.gl/react-google-maps';

function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number) {
  if (!lat1 || !lat2) return 0;
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function Dashboard() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [ubicacionAdulto, setUbicacionAdulto] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [dentroZona, setDentroZona] = useState(true);
  const [ultimaVez, setUltimaVez] = useState<string>('');
  const [tab, setTab] = useState<'mapa'|'historial'>('mapa');

  useEffect(() => {
    const p = localStorage.getItem('cuidagt_familiar');
    if (!p) { router.push('/familiar'); return; }
    const parsed = JSON.parse(p);
    setPerfil(parsed);
    if (parsed.homeLat) {
      setUbicacionAdulto({ lat: parsed.homeLat, lng: parsed.homeLng });
    }
  }, []);

  useEffect(() => {
    if (!perfil) return;
    cargarAlertas();
    const interval = setInterval(cargarAlertas, 15000);
    return () => clearInterval(interval);
  }, [perfil]);

  const cargarAlertas = async () => {
    try {
      const response = await fetch('/api/familiar/alertas');
      const data = await response.json();
      if (data.success) {
        setAlertas(data.alertas);
        const ultima = data.alertas[0];
        if (ultima && ultima.lat && ultima.lat !== 0) {
          setUbicacionAdulto({ lat: ultima.lat, lng: ultima.lng });
          setUltimaVez(new Date(ultima.timestamp).toLocaleTimeString('es-GT'));
          const dist = calcularDistancia(ultima.lat, ultima.lng, perfil?.homeLat, perfil?.homeLng);
          setDentroZona(dist <= (perfil?.radioZona || 200));
        }
      }
    } catch (e) { console.error(e); }
  };

  if (!perfil) return null;

  const alertasCriticas = alertas.filter((a: any) => a.subtipo === 'panico' || a.subtipo === 'fuera_zona').length;
  const mapCenter = ubicacionAdulto || { lat: 14.6349, lng: -90.5069 };

  return (
    <main style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'sans-serif'}}>

      <div style={{background:'linear-gradient(135deg, #1e3a8a, #1d4ed8)',padding:'14px 20px'}}>
        <div style={{maxWidth:'500px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{background:'#FACC15',borderRadius:'10px',padding:'7px'}}>
              <span style={{fontSize:'22px'}}>👴</span>
            </div>
            <div>
              <h1 style={{color:'white',fontWeight:'900',fontSize:'17px',margin:0}}>CuidaGT</h1>
              <p style={{color:'rgba(255,255,255,0.7)',fontSize:'11px',margin:0}}>Hola, {perfil.nombre}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <div style={{background:dentroZona?'rgba(34,197,94,0.3)':'rgba(220,38,38,0.3)',borderRadius:'20px',padding:'4px 10px',border:dentroZona?'1px solid rgba(34,197,94,0.5)':'1px solid rgba(220,38,38,0.5)'}}>
              <span style={{color:dentroZona?'#4ade80':'#f87171',fontSize:'12px',fontWeight:'700'}}>
                {dentroZona ? '✅ En zona' : '⚠️ Fuera'}
              </span>
            </div>
            <button onClick={() => { localStorage.removeItem('cuidagt_familiar'); router.push('/familiar'); }}
              style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'8px',padding:'6px 10px',cursor:'pointer',color:'white',fontSize:'11px',fontWeight:'700'}}>
              Editar
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'500px',margin:'0 auto',padding:'16px'}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'16px'}}>
          {[
            {label:'Total alertas', valor:alertas.length, color:'#1e3a8a'},
            {label:'Criticas', valor:alertasCriticas, color:'#dc2626'},
            {label:'Panicos', valor:alertas.filter((a:any)=>a.subtipo==='panico').length, color:'#991b1b'},
          ].map((s,i) => (
            <div key={i} style={{background:'white',borderRadius:'12px',padding:'12px',textAlign:'center',boxShadow:'0 2px 6px rgba(0,0,0,0.06)',borderTop:`3px solid ${s.color}`}}>
              <p style={{color:s.color,fontWeight:'900',fontSize:'24px',margin:'0 0 2px'}}>{s.valor}</p>
              <p style={{color:'#64748b',fontSize:'11px',margin:0}}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {(['mapa','historial'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{flex:1,padding:'10px',borderRadius:'20px',border:'none',cursor:'pointer',fontWeight:'700',fontSize:'13px',background:tab===t?'#1e3a8a':'white',color:tab===t?'white':'#64748b',boxShadow:'0 2px 6px rgba(0,0,0,0.06)'}}>
              {t === 'mapa' ? '🗺️ Mapa en vivo' : '📋 Historial'}
            </button>
          ))}
        </div>

        {tab === 'mapa' && (
          <div style={{background:'white',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:'16px'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{color:'#1e293b',fontWeight:'900',fontSize:'14px',margin:'0 0 2px'}}>👴 {perfil.nombreAdulto}</p>
                {ultimaVez && <p style={{color:'#94a3b8',fontSize:'11px',margin:0}}>Actualizado: {ultimaVez}</p>}
              </div>
              <button onClick={cargarAlertas} style={{background:'#f0f4f8',border:'none',borderRadius:'8px',padding:'6px 10px',cursor:'pointer',fontSize:'12px',color:'#64748b',fontWeight:'700'}}>
                🔄 Actualizar
              </button>
            </div>

            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}>
              <Map
                style={{width:'100%',height:'320px'}}
                defaultCenter={mapCenter}
                defaultZoom={16}
                gestureHandling="greedy"
              >
                {ubicacionAdulto && (
                  <Marker
                    position={ubicacionAdulto}
                    title={perfil.nombreAdulto}
                  />
                )}
                {perfil.homeLat && (
                  <Circle
                 center={{lat: perfil.homeLat, lng: perfil.homeLng}}
                 radius={perfil.radioZona || 200}
                 fillColor={dentroZona ? '#22c55e' : '#ef4444'}
                 fillOpacity={0.15}
                 strokeColor={dentroZona ? '#16a34a' : '#dc2626'}
                 strokeOpacity={0.8}
                 strokeWeight={2}
                 />
                )}
              </Map>
            </APIProvider>

            <div style={{padding:'12px 16px',display:'flex',gap:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#64748b'}}>
                <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#22c55e',opacity:0.6}}/>
                Zona segura ({perfil.radioZona || 200}m)
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#64748b'}}>
                <span>📍</span> Ubicacion actual
              </div>
            </div>
          </div>
        )}

        {tab === 'historial' && (
          <div style={{background:'white',borderRadius:'16px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:'16px'}}>
            <p style={{color:'#1e293b',fontWeight:'900',fontSize:'14px',marginBottom:'12px'}}>📋 Historial de alertas</p>
            {alertas.length === 0 ? (
              <p style={{color:'#94a3b8',fontSize:'13px',textAlign:'center',padding:'20px 0'}}>Sin alertas registradas</p>
            ) : alertas.slice(0,20).map((alerta:any, i:number) => (
              <div key={i} style={{borderBottom:'1px solid #f1f5f9',paddingBottom:'10px',marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <span style={{fontWeight:'700',fontSize:'13px',color:'#1e293b'}}>
                      {alerta.subtipo === 'panico' ? '🆘' : alerta.subtipo === 'fuera_zona' ? '⚠️' : '📍'} {alerta.subtipo?.replace(/_/g,' ') || alerta.tipo}
                    </span>
                    {alerta.descripcion && <p style={{color:'#64748b',fontSize:'12px',margin:'2px 0 0'}}>{alerta.descripcion}</p>}
                    {alerta.direccion && <p style={{color:'#0369a1',fontSize:'12px',margin:'2px 0 0'}}>📍 {alerta.direccion}</p>}
                  </div>
                  <span style={{fontSize:'11px',color:'#94a3b8',whiteSpace:'nowrap',marginLeft:'8px'}}>
                    {new Date(alerta.timestamp).toLocaleTimeString('es-GT')}
                  </span>
                </div>
                {alerta.lat && alerta.lat !== 0 && (
                  <a href={`https://maps.google.com/?q=${alerta.lat},${alerta.lng}`} target="_blank" rel="noreferrer"
                    style={{color:'#2563eb',fontSize:'12px',fontWeight:'600',textDecoration:'none'}}>
                    🗺️ Ver en mapa
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={() => router.push('/cuidador')}
          style={{width:'100%',padding:'16px',background:'#FACC15',borderRadius:'14px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:'#1e3a8a',marginBottom:'10px'}}>
          👴 Pantalla del adulto mayor
        </button>

        <button onClick={() => window.location.href=`tel:${perfil.telefonoAdulto}`}
          style={{width:'100%',padding:'14px',background:'#15803d',borderRadius:'14px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'14px',color:'white'}}>
          📞 Llamar a {perfil.nombreAdulto}
        </button>

      </div>
    </main>
  );
}