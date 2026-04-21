'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const perfil = localStorage.getItem('cuidagt_familiar');
    if (perfil) {
      router.push('/dashboard');
    } else {
      router.push('/familiar');
    }
  }, []);

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg, #1e3a8a, #1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{background:'#FACC15',borderRadius:'50%',width:'80px',height:'80px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <span style={{fontSize:'40px'}}>👴</span>
        </div>
        <h1 style={{color:'white',fontWeight:'900',fontSize:'28px',margin:'0 0 8px'}}>CuidaGT</h1>
        <p style={{color:'rgba(255,255,255,0.7)',fontSize:'14px'}}>Cargando...</p>
      </div>
    </main>
  );
}