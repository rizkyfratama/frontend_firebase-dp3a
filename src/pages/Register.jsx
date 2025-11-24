import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({ email: '', nama: '', nik: '', noHp: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) return setError("Password tidak sama!");
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = cred.user;
      
      const isPetugas = formData.email.toLowerCase().includes('petugas') || formData.email.toLowerCase().includes('admin');
      const role = isPetugas ? 'admin' : 'Masyarakat'; 

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        name: formData.nama,
        nik: String(formData.nik),
        no_hp: String(formData.noHp),
        role: role, 
        createdAt: serverTimestamp() 
      });
      alert(`Pendaftaran Berhasil sebagai ${role}! Login otomatis.`);
    } catch (err) {
      setError("Gagal Mendaftar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* BACKGROUND IMAGE BLUR */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/5/5a/Balai_Kota_Banjarmasin.jpg')",
          filter: "blur(4px) brightness(0.6)" 
        }}
      ></div>

      {/* CARD CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]"
      >
        
        {/* BAGIAN KIRI (BRANDING - Biru Gelap) */}
        <div className="w-full md:w-5/12 bg-[#0f172a] text-white flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-6 bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <img 
                  src="/logo-dp3a.png" 
                  onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png"}
                  alt="Logo DP3A" 
                  className="w-28 h-28 object-contain drop-shadow-lg" 
                />
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-[#fbbf24] tracking-wide">Buat Akun Baru</h2>
            <p className="text-slate-300 text-base">Bergabunglah untuk layanan pengaduan masyarakat yang lebih baik.</p>
        </div>

        {/* BAGIAN KANAN (FORM REGISTER - Putih) */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-[#0f172a] pl-4">Formulir Pendaftaran</h3>

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1">Nama Lengkap</label>
                        <input name="nama" onChange={handleChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded focus:ring-2 focus:ring-[#0f172a] outline-none" required placeholder="Sesuai KTP" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1">NIK</label>
                        <input name="nik" type="number" onChange={handleChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded focus:ring-2 focus:ring-[#0f172a] outline-none" required placeholder="16 Digit" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1">Email</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded focus:ring-2 focus:ring-[#0f172a] outline-none" required placeholder="email@contoh.com" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1">No HP</label>
                        <input name="noHp" type="number" onChange={handleChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded focus:ring-2 focus:ring-[#0f172a] outline-none" required placeholder="08xxx" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1">Password</label>
                        <input name="password" type="password" onChange={handleChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded focus:ring-2 focus:ring-[#0f172a] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-xs font-bold mb-1">Konfirmasi Password</label>
                        <input name="confirm" type="password" onChange={handleChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded focus:ring-2 focus:ring-[#0f172a] outline-none" required />
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform active:scale-95"
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-slate-500">Sudah punya akun? </span>
                <button onClick={onSwitchToLogin} className="text-[#0f172a] font-bold hover:underline">
                  Login di sini
                </button>
            </div>
        </div>

      </motion.div>
    </div>
  );
}