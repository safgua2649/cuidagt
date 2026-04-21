'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Familiar() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState({
    nombre: '',
    telefono: '',
    email: '',
    nombreAdulto: '',
    telefonoAdulto: '',
    radioZona: 200,
    recordatorioMedicamento: '',
    horaBienestar: '08:00',
  });

  const guardar = () => {
    localStorage.setItem('cuidagt_familiar', JSON.stringify(datos));
    router.push('/dashboard');
  };

  const inp = {
    width: '100%',
    background: 'rgba(30,58,138,0.08)',
    border: '2px solid rgba(30,58,138,0.2)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#1e3a8a',
    fontSize: '15px',
    marginBottom: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const lbl = {
    color: '#1e3a8a',
    fontSize: '13px',
    fontWeight: '700' as const,
    display: 'block' as const,
    marginBottom: '6px',
    opacity: 0.8,
  };

  if (paso === 0) {
    return (
      <main style={{minHeight:'100vh',background:'#FACC15',fontFamily:'sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <div style={{maxWidth:'340px',width:'100%',textAlign:'center'}}>
          <div style={{background:'#1e3a8a',borderRadius:'24px',width:'88px',height:'88px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:'44px'}}>
            👴
          </div>
          <h1 style={{color:'#1e3a8a',fontSize:'38px',fontWeight:'900',margin:'0 0 8px',letterSpacing:'1px'}}>CuidaGT</h1>
          <p style={{color:'#1e3a8a',fontSize:'15px',margin:'0 0 48px',fontWeight:'600',opacity:0.8}}>El guardian digital del adulto mayor</p>

          <button onClick={() => setPaso(1)}
            style={{width:'100%',padding:'18px',background:'#1e3a8a',borderRadius:'14px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:'#FACC15',marginBottom:'12px'}}>
            👨‍👩‍👧 Familiar o responsable
          </button>
          <button onClick={() => router.push('/cuidador')}
            style={{width:'100%',padding:'18px',background:'rgba(30,58,138,0.12)',borderRadius:'14px',border:'2px solid #1e3a8a',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:'#1e3a8a'}}>
            👴 Soy adulto mayor
          </button>

          <p style={{color:'#1e3a8a',fontSize:'11px',marginTop:'32px',opacity:0.6}}>
            Proteccion inteligente con GPS y AI
          </p>
        </div>
      </main>
    );
  }

  if (paso === 1) {
    return (
      <main style={{minHeight:'100vh',background:'#FACC15',fontFamily:'sans-serif',padding:'20px'}}>
        <div style={{maxWidth:'400px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',paddingTop:'20px',marginBottom:'24px'}}>
            <button onClick={() => setPaso(0)} style={{background:'rgba(30,58,138,0.15)',borderRadius:'50%',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',flexShrink:0}}>
              <span style={{color:'#1e3a8a',fontSize:'18px',fontWeight:'900'}}>←</span>
            </button>
            <div>
              <h2 style={{color:'#1e3a8a',fontWeight:'900',fontSize:'20px',margin:0}}>Datos del familiar</h2>
              <p style={{color:'#1e3a8a',fontSize:'12px',margin:0,opacity:0.7}}>Paso 1 de 2</p>
            </div>
          </div>

          <div style={{background:'white',borderRadius:'20px',padding:'24px',boxShadow:'0 4px 20px rgba(30,58,138,0.15)'}}>
            <label style={lbl}>Tu nombre completo *</label>
            <input value={datos.nombre} onChange={e => setDatos(p=>({...p,nombre:e.target.value}))} placeholder="Ej: María García" style={inp}/>

            <label style={lbl}>Tu WhatsApp *</label>
            <input value={datos.telefono} onChange={e => setDatos(p=>({...p,telefono:e.target.value}))} placeholder="502XXXXXXXX" type="tel" style={inp}/>

            <label style={lbl}>Tu correo electronico</label>
            <input value={datos.email} onChange={e => setDatos(p=>({...p,email:e.target.value}))} placeholder="correo@gmail.com" type="email" style={inp}/>

            <button onClick={() => datos.nombre && datos.telefono ? setPaso(2) : null}
              style={{width:'100%',padding:'16px',background:datos.nombre&&datos.telefono?'#1e3a8a':'rgba(30,58,138,0.2)',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:datos.nombre&&datos.telefono?'#FACC15':'rgba(30,58,138,0.4)',marginTop:'8px'}}>
              Siguiente →
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (paso === 2) {
    return (
      <main style={{minHeight:'100vh',background:'#FACC15',fontFamily:'sans-serif',padding:'20px'}}>
        <div style={{maxWidth:'400px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',paddingTop:'20px',marginBottom:'24px'}}>
            <button onClick={() => setPaso(1)} style={{background:'rgba(30,58,138,0.15)',borderRadius:'50%',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',flexShrink:0}}>
              <span style={{color:'#1e3a8a',fontSize:'18px',fontWeight:'900'}}>←</span>
            </button>
            <div>
              <h2 style={{color:'#1e3a8a',fontWeight:'900',fontSize:'20px',margin:0}}>Datos del adulto mayor</h2>
              <p style={{color:'#1e3a8a',fontSize:'12px',margin:0,opacity:0.7}}>Paso 2 de 2</p>
            </div>
          </div>

          <div style={{background:'white',borderRadius:'20px',padding:'24px',boxShadow:'0 4px 20px rgba(30,58,138,0.15)'}}>
            <label style={lbl}>Nombre del adulto mayor *</label>
            <input value={datos.nombreAdulto} onChange={e => setDatos(p=>({...p,nombreAdulto:e.target.value}))} placeholder="Ej: Abuela Rosa" style={inp}/>

            <label style={lbl}>WhatsApp del adulto mayor</label>
            <input value={datos.telefonoAdulto} onChange={e => setDatos(p=>({...p,telefonoAdulto:e.target.value}))} placeholder="502XXXXXXXX" type="tel" style={inp}/>

            <label style={lbl}>Radio de zona segura: {datos.radioZona}m</label>
            <input type="range" min="50" max="500" step="50" value={datos.radioZona}
              onChange={e => setDatos(p=>({...p,radioZona:parseInt(e.target.value)}))}
              style={{width:'100%',marginBottom:'6px',accentColor:'#1e3a8a'}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
              <span style={{color:'#1e3a8a',fontSize:'11px',opacity:0.6}}>50m (casa)</span>
              <span style={{color:'#1e3a8a',fontSize:'11px',opacity:0.6}}>500m (vecindario)</span>
            </div>

            <label style={lbl}>Hora de check-in diario de bienestar</label>
            <input type="time" value={datos.horaBienestar}
              onChange={e => setDatos(p=>({...p,horaBienestar:e.target.value}))}
              style={{...inp, marginBottom:'14px'}}/>

            <label style={lbl}>Recordatorio de medicamento (opcional)</label>
            <input value={datos.recordatorioMedicamento}
              onChange={e => setDatos(p=>({...p,recordatorioMedicamento:e.target.value}))}
              placeholder="Ej: Metformina 8am y 8pm" style={inp}/>

            <button onClick={guardar} disabled={!datos.nombreAdulto}
              style={{width:'100%',padding:'16px',background:datos.nombreAdulto?'#1e3a8a':'rgba(30,58,138,0.2)',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:datos.nombreAdulto?'#FACC15':'rgba(30,58,138,0.4)',marginTop:'8px'}}>
              ✅ Activar CuidaGT
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}