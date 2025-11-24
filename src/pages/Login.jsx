import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Email atau password salah.");
      } else {
        setError("Gagal Login: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* BACKGROUND IMAGE BLUR (Seperti di video) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/5/5a/Balai_Kota_Banjarmasin.jpg')", // Gambar Balai Kota / Gedung Pemda
          filter: "blur(4px) brightness(0.6)" 
        }}
      ></div>

      {/* CARD CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[500px]"
      >
        
        {/* BAGIAN KIRI (BRANDING - Biru Gelap) */}
        <div className="w-full md:w-1/2 bg-[#0f172a] text-white flex flex-col items-center justify-center p-10 text-center">
            {/* LOGO AREA */}
            <div className="mb-6 bg-white/10 p-4 rounded-full backdrop-blur-sm">
                {/* Ganti src ini dengan file logo Anda di folder public */}
                {/* Jika belum ada logo, pakai placeholder ini */}
                <img 
                  src="/logo-dp3a.png" 
                  onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png"}
                  alt="Logo DP3A" 
                  className="w-28 h-28 object-contain drop-shadow-lg" 
                />
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-[#fbbf24] tracking-wide drop-shadow-md">Selamat Datang</h2>
            <p className="text-slate-300 text-lg font-medium">Portal Pengaduan DP3A</p>
            <p className="text-slate-400 text-sm mt-1">Kota Banjarmasin</p>
        </div>

        {/* BAGIAN KANAN (FORM LOGIN - Putih) */}
        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-8 border-l-4 border-[#0f172a] pl-4">Login</h3>

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:bg-white transition duration-200"
                      placeholder="nama@email.com"
                      required
                    />
                </div>
                <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:bg-white transition duration-200"
                      placeholder="********"
                      required
                    />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform active:scale-95 flex justify-center items-center"
                >
                  {loading ? 'Memuat...' : 'Login'}
                </button>
            </form>

            <div className="mt-6 flex justify-between items-center text-sm">
                <button className="text-slate-500 hover:text-[#0f172a]">Lupa password?</button>
                <button 
                  onClick={onSwitchToRegister} 
                  className="text-[#0f172a] font-bold hover:underline"
                >
                  Daftar
                </button>
            </div>
        </div>

      </motion.div>
    </div>
  );
}