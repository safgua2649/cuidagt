'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Familiar() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
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

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg, #1e3a8a, #1d4ed8)',fontFamily:'sans-serif',padding:'20px'}}>
      <div style={{maxWidth:'400px',margin:'0 auto'}}>
        <div style={{textAlign:'center',paddingTop:'20px',marginBottom:'24px'}}>
          <div style={{background:'#FACC15',borderRadius:'50%',width:'64px',height:'64px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
            <span style={{fontSize:'32px'}}>👴</span>
          </div>
          <h1 style={{color:'white',fontWeight:'900',fontSize:'24px',margin:'0 0 4px'}}>CuidaGT</h1>
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:'13px',margin:0}}>Proteccion inteligente para adultos mayores</p>
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
          {[1,2].map(n => (
            <div key={n} style={{height:'6px',flex:1,borderRadius:'3px',background:paso>=n?'#FACC15':'rgba(255,255,255,0.2)'}}/>
          ))}
        </div>

        {paso === 1 && (
          <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'16px',padding:'20px'}}>
            <p style={{color:'#FACC15',fontWeight:'900',fontSize:'14px',marginBottom:'16px'}}>👨‍👩‍👧 Datos del familiar responsable</p>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Tu nombre completo *</label>
            <input value={datos.nombre} onChange={e => setDatos(p=>({...p,nombre:e.target.value}))} placeholder="Tu nombre" style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'12px',boxSizing:'border-box'}}/>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Tu WhatsApp *</label>
            <input value={datos.telefono} onChange={e => setDatos(p=>({...p,telefono:e.target.value}))} placeholder="502XXXXXXXX" type="tel" style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'12px',boxSizing:'border-box'}}/>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Tu correo electronico</label>
            <input value={datos.email} onChange={e => setDatos(p=>({...p,email:e.target.value}))} placeholder="correo@gmail.com" type="email" style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'20px',boxSizing:'border-box'}}/>
            <button onClick={() => datos.nombre && datos.telefono ? setPaso(2) : null}
              style={{width:'100%',padding:'16px',background:datos.nombre&&datos.telefono?'#FACC15':'rgba(255,255,255,0.2)',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'16px',color:datos.nombre&&datos.telefono?'#1e3a8a':'rgba(255,255,255,0.5)'}}>
              Siguiente →
            </button>
          </div>
        )}

        {paso === 2 && (
          <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'16px',padding:'20px'}}>
            <p style={{color:'#FACC15',fontWeight:'900',fontSize:'14px',marginBottom:'16px'}}>👴 Datos del adulto mayor</p>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Nombre del adulto mayor *</label>
            <input value={datos.nombreAdulto} onChange={e => setDatos(p=>({...p,nombreAdulto:e.target.value}))} placeholder="Ej: Abuela Rosa" style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'12px',boxSizing:'border-box'}}/>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>WhatsApp del adulto mayor</label>
            <input value={datos.telefonoAdulto} onChange={e => setDatos(p=>({...p,telefonoAdulto:e.target.value}))} placeholder="502XXXXXXXX" type="tel" style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'12px',boxSizing:'border-box'}}/>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Radio zona segura: {datos.radioZona}m</label>
            <input type="range" min="50" max="500" step="50" value={datos.radioZona} onChange={e => setDatos(p=>({...p,radioZona:parseInt(e.target.value)}))} style={{width:'100%',marginBottom:'12px'}}/>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Hora de check-in diario</label>
            <input type="time" value={datos.horaBienestar} onChange={e => setDatos(p=>({...p,horaBienestar:e.target.value}))} style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'12px',boxSizing:'border-box'}}/>
            <label style={{color:'rgba(255,255,255,0.9)',fontSize:'12px',fontWeight:'700',display:'block',marginBottom:'4px'}}>Recordatorio de medicamento (opcional)</label>
            <input value={datos.recordatorioMedicamento} onChange={e => setDatos(p=>({...p,recordatorioMedicamento:e.target.value}))} placeholder="Ej: Metformina 8am y 8pm" style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',padding:'12px 14px',color:'white',fontSize:'14px',marginBottom:'20px',boxSizing:'border-box'}}/>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => setPaso(1)} style={{flex:1,padding:'14px',background:'rgba(255,255,255,0.2)',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'14px',color:'white'}}>← Atras</button>
              <button onClick={guardar} disabled={!datos.nombreAdulto}
                style={{flex:2,padding:'14px',background:datos.nombreAdulto?'#FACC15':'rgba(255,255,255,0.2)',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'900',fontSize:'14px',color:datos.nombreAdulto?'#1e3a8a':'rgba(255,255,255,0.5)'}}>
                ✅ Activar CuidaGT
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}