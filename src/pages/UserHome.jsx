import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { 
  LogOut, User, Search, Phone, Home, FileText, Menu, ChevronRight, Send, X, MapPin, Clock, AlertCircle, Calendar, Tag, Copy, Settings, CheckCircle, FileBarChart, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserHome({ user }) {
  const [view, setView] = useState('home'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diproses: 0, selesai: 0 });
  const [laporanUser, setLaporanUser] = useState([]); 
  const [form, setForm] = useState({ judul: '', kategori: 'Kekerasan Fisik', lokasi: '', kronologi: '', tanggal: '' });
  const [searchToken, setSearchToken] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
     if (!user || !user.uid) return;
     const q = query(collection(db, "laporan"), where("userId", "==", user.uid));
     const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.dibuatPada?.seconds || 0) - (a.dibuatPada?.seconds || 0));
        setLaporanUser(data);
        const total = snapshot.size;
        const menunggu = snapshot.docs.filter(d => d.data().status === 'Menunggu').length;
        const diproses = snapshot.docs.filter(d => d.data().status === 'Diproses').length;
        const selesai = snapshot.docs.filter(d => d.data().status === 'Selesai').length;
        setStats({ total, menunggu, diproses, selesai });
     });
     return () => unsubscribe();
  }, [user]);

  const kirimLaporan = async (e) => {
    e.preventDefault();
    try {
      if(!form.tanggal) { alert("Mohon isi tanggal!"); return; }
      const [y, m, d] = form.tanggal.split('-');
      const docRef = await addDoc(collection(db, "laporan"), {
        userId: user.uid, emailPelapor: user.email, tanggalKejadian: `${d}/${m}/${y}`, ...form, status: "Menunggu", nama_pelapor: user.name || user.email, dibuatPada: serverTimestamp(), 
      });
      alert(`Laporan Terkirim!\n\nTOKEN LACAK: ${docRef.id}\n(Simpan token ini untuk melacak status laporan)`);
      setForm({ judul: '', kategori: 'Kekerasan Fisik', lokasi: '', kronologi: '', tanggal: '' });
      setView('history'); 
    } catch (err) { alert('Gagal: ' + err.message); }
  };

  const handleLacak = async (e) => {
    e.preventDefault();
    if(!searchToken) return;
    setTrackLoading(true); setTrackError(''); setTrackResult(null);
    try {
        const docRef = doc(db, "laporan", searchToken.trim());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { setTrackResult({ id: docSnap.id, ...docSnap.data() }); } 
        else { setTrackError("Token tidak ditemukan. Mohon periksa kembali."); }
    } catch (err) { setTrackError("Terjadi kesalahan: " + err.message); } 
    finally { setTrackLoading(false); }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : 'menunggu';
    switch(s) {
        case 'selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'diproses': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'ditolak': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => {
    const isActive = view === id;
    return (
    <button onClick={() => {setView(id); setSidebarOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} /> <span className="text-sm font-medium">{label}</span>
    </button>
  )};

  const pageVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  return (
    <div className="flex h-screen font-sans overflow-hidden bg-slate-50">
      <aside className={`fixed md:relative z-30 w-64 h-full bg-[#0f172a] text-white flex flex-col transition-transform duration-300 shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg">P</div>
              <div><span className="block text-white font-bold text-lg leading-none">Portal</span><span className="text-emerald-400 font-bold text-lg leading-none">DP3A</span></div>
           </div>
           <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold border border-slate-600"><User size={20} /></div>
              <div className="overflow-hidden"><p className="text-white text-sm font-semibold truncate">{user.name}</p><p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Masyarakat</p></div>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
            <SidebarItem id="home" icon={Home} label="Beranda" />
            <SidebarItem id="form" icon={FileText} label="Buat Pengaduan" />
            <SidebarItem id="history" icon={Clock} label="Pengaduan Saya" />
            <SidebarItem id="tracking" icon={Search} label="Lacak Pengaduan" />
            <SidebarItem id="contact" icon={Phone} label="Kontak Dinas" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => signOut(auth)} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"><LogOut size={20} /><span className="text-sm font-medium">Keluar Akun</span></button>
        </div>
      </aside>

      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"></div>}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 shadow-sm z-10 text-white">
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-white hover:text-emerald-400"><Menu/></button>
             <div className="flex items-center gap-3">
                <img src="/logo-dp3a.png" alt="Logo" onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png"} className="h-10 w-auto object-contain hidden sm:block" />
                <div><h1 className="text-sm font-bold text-white hidden sm:block leading-tight">Dinas Pemberdayaan Perempuan dan Perlindungan Anak</h1><h1 className="text-sm font-bold text-white sm:hidden">Portal DP3A</h1><p className="text-xs text-slate-400 hidden sm:block mt-0.5">Kota Banjarmasin - Portal Masyarakat</p></div>
             </div>
           </div>
           <div className="flex items-center space-x-4"><div className="text-right hidden sm:block"><p className="text-xs text-slate-400">Tanggal Hari Ini</p><p className="text-sm font-bold text-white">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50">
          <div className="max-w-5xl mx-auto pb-10">
            <AnimatePresence initial={false}>
            
            {view === 'home' && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-8">
                 <div className="relative bg-[#0f172a] rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 max-w-3xl">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">Halo, {user.name} 👋</h2>
                      <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-2xl">Suara Anda berharga. Kami hadir untuk mendampingi dan memastikan setiap laporan ditindaklanjuti dengan aman.</p>
                      <button onClick={() => setView('form')} className="px-6 py-3 bg-[#fbbf24] text-slate-900 font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition-colors flex items-center">Buat Laporan Baru <ChevronRight className="ml-2 w-5 h-5"/></button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col"><div className="flex items-center justify-between mb-2"><span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Total Laporan</span><div className="p-2 bg-slate-100 rounded-lg text-slate-600"><FileBarChart size={18}/></div></div><span className="text-3xl font-bold text-slate-800 mt-auto">{stats.total}</span></div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col"><div className="flex items-center justify-between mb-2"><span className="text-amber-600 text-xs font-bold uppercase tracking-wide">Menunggu</span><div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock size={18}/></div></div><span className="text-3xl font-bold text-amber-600 mt-auto">{stats.menunggu}</span></div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col"><div className="flex items-center justify-between mb-2"><span className="text-blue-600 text-xs font-bold uppercase tracking-wide">Diproses</span><div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Settings size={18}/></div></div><span className="text-3xl font-bold text-blue-600 mt-auto">{stats.diproses}</span></div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col"><div className="flex items-center justify-between mb-2"><span className="text-emerald-600 text-xs font-bold uppercase tracking-wide">Selesai</span><div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={18}/></div></div><span className="text-3xl font-bold text-emerald-600 mt-auto">{stats.selesai}</span></div>
                 </div>
              </motion.div>
            )}

            {view === 'form' && (
               <motion.div key="form" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-8 py-6 border-b border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Formulir Pengaduan</h2><p className="text-slate-500 text-sm mt-1">Isi detail kejadian dengan sebenar-benarnya.</p></div>
                  <div className="p-8"><form onSubmit={kirimLaporan} className="space-y-6"><div className="space-y-2"><label className="text-sm font-bold text-slate-700">Judul Laporan</label><input value={form.judul} onChange={(e)=>setForm({...form, judul:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] outline-none transition-all" placeholder="Contoh: Kekerasan di Sekolah..." required/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-sm font-bold text-slate-700">Kategori</label><select value={form.kategori} onChange={(e)=>setForm({...form, kategori:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] outline-none"><option>Kekerasan Fisik</option><option>Kekerasan Seksual</option><option>Kekerasan Psikologis</option><option>Penelantaran</option><option>Lainnya</option></select></div><div className="space-y-2"><label className="text-sm font-bold text-slate-700">Tanggal Kejadian</label><input type="date" value={form.tanggal} onChange={(e)=>setForm({...form, tanggal:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] outline-none" required/></div></div><div className="space-y-2"><label className="text-sm font-bold text-slate-700">Lokasi Kejadian</label><input value={form.lokasi} onChange={(e)=>setForm({...form, lokasi:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] outline-none" placeholder="Nama Jalan, Gedung, dll..." required/></div><div className="space-y-2"><label className="text-sm font-bold text-slate-700">Kronologi Lengkap</label><textarea value={form.kronologi} onChange={(e)=>setForm({...form, kronologi:e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f172a] outline-none h-32 resize-none" placeholder="Ceritakan detail kejadian..." required></textarea></div><div className="pt-4 flex items-center justify-end space-x-4"><button type="button" onClick={() => setView('home')} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition">Batal</button><button type="submit" className="px-6 py-2 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-lg shadow-md transition flex items-center"><Send size={18} className="mr-2"/> Kirim</button></div></form></div>
               </motion.div>
            )}

            {view === 'history' && (
               <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                 <div className="flex justify-between items-end mb-2"><div><h2 className="text-2xl font-bold text-slate-800">Pengaduan Saya</h2><p className="text-slate-500">Daftar laporan yang pernah Anda kirimkan.</p></div><button onClick={() => setView('form')} className="px-4 py-2 bg-[#0f172a] text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center"><FileText size={16} className="mr-2"/> Buat Baru</button></div>
                 {laporanUser.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm"><div className="bg-slate-100 p-6 rounded-full mb-4"><Search size={40} className="text-slate-400"/></div><h3 className="text-xl font-bold text-slate-700">Belum Ada Riwayat</h3><p className="text-slate-500 mt-2">Anda belum mengirimkan pengaduan apapun.</p><button onClick={() => setView('form')} className="mt-6 text-[#0f172a] font-bold hover:underline">Buat Pengaduan Pertama</button></div>
                 ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {laporanUser.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === 'Selesai' ? 'bg-emerald-500' : item.status === 'Diproses' ? 'bg-blue-500' : item.status === 'Ditolak' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(item.status)}`}>{item.status || "Menunggu"}</span><span className="text-xs text-slate-400 flex items-center"><Calendar size={12} className="mr-1"/> {item.dibuatPada?.seconds ? new Date(item.dibuatPada.seconds * 1000).toLocaleDateString('id-ID') : 'Baru saja'}</span><span className="text-xs text-slate-400 flex items-center bg-slate-100 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200" onClick={() => {navigator.clipboard.writeText(item.id); alert('Token disalin!')}} title="Klik untuk salin Token"><Copy size={10} className="mr-1"/> ID: {item.id}</span></div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{item.judul}</h3>
                                        <div className="text-sm text-slate-500 space-y-1 mb-3"><div className="flex items-center"><Tag size={14} className="mr-2"/> {item.kategori}</div><div className="flex items-center"><MapPin size={14} className="mr-2"/> {item.lokasi}</div></div>
                                        
                                        {/* --- TANGGAPAN PETUGAS (FIELD: tanggapanPetugas) --- */}
                                        {item.tanggapanPetugas && (
                                            <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-600 flex items-center mb-1"><MessageSquare size={12} className="mr-1"/> TANGGAPAN PETUGAS</p>
                                                <p className="text-sm text-slate-700">{item.tanggapanPetugas}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="hidden md:flex flex-col items-end justify-center">
                                        <div className="flex items-center space-x-1 text-xs font-bold text-slate-300"><div className={`h-2 w-8 rounded-full ${['menunggu','diproses','selesai'].includes(item.status?.toLowerCase()) ? 'bg-amber-400' : 'bg-slate-200'}`}></div><div className={`h-2 w-8 rounded-full ${['diproses','selesai'].includes(item.status?.toLowerCase()) ? 'bg-blue-500' : 'bg-slate-200'}`}></div><div className={`h-2 w-8 rounded-full ${item.status?.toLowerCase() === 'selesai' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div></div>
                                        <span className="text-xs text-slate-400 mt-2">{item.status === 'Selesai' ? 'Laporan Tuntas' : item.status === 'Diproses' ? 'Sedang Ditangani' : 'Menunggu Petugas'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
               </motion.div>
            )}

            {view === 'tracking' && (
               <motion.div key="tracking" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Lacak Status Pengaduan</h2>
                    <p className="text-slate-500 mb-8">Masukkan Token ID pengaduan Anda untuk melihat status terkini.</p>
                    <form onSubmit={handleLacak} className="mb-6"><div className="relative"><input type="text" value={searchToken} onChange={(e) => setSearchToken(e.target.value)} placeholder="Tempel Token ID di sini..." className="w-full p-4 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f172a] outline-none text-center font-mono text-lg" required /><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/></div><button type="submit" disabled={trackLoading} className="w-full mt-4 py-3 bg-[#0f172a] text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-md">{trackLoading ? 'Mencari...' : 'Lacak Sekarang'}</button></form>
                    {trackError && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-center"><AlertCircle size={20} className="mr-2"/> {trackError}</div>}
                    {trackResult && (
                        <div className="mt-6 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-fade-in">
                            <div className="flex justify-between items-start mb-4"><div><p className="text-xs text-slate-500 font-bold uppercase">Judul Laporan</p><h3 className="text-lg font-bold text-slate-800">{trackResult.judul}</h3></div><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(trackResult.status)}`}>{trackResult.status || "Menunggu"}</span></div>
                            <div className="space-y-3 text-sm text-slate-600 mb-4">
                                <div className="flex justify-between border-b border-slate-200 pb-2"><span>Tanggal:</span><span className="font-semibold">{trackResult.tanggalKejadian}</span></div>
                                <div className="flex justify-between border-b border-slate-200 pb-2"><span>Kategori:</span><span className="font-semibold">{trackResult.kategori}</span></div>
                                <div className="flex justify-between border-b border-slate-200 pb-2"><span>Lokasi:</span><span className="font-semibold">{trackResult.lokasi}</span></div>
                            </div>
                            
                            {/* --- TANGGAPAN PETUGAS (FIELD: tanggapanPetugas) --- */}
                            {trackResult.tanggapanPetugas && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 flex items-center mb-1"><MessageSquare size={12} className="mr-1"/> TANGGAPAN PETUGAS</p>
                                    <p className="text-sm text-slate-700">{trackResult.tanggapanPetugas}</p>
                                </div>
                            )}
                            
                            <div className="mt-4 pt-4 text-center"><button onClick={() => {setSearchToken(''); setTrackResult(null);}} className="text-sm text-slate-500 hover:text-[#0f172a] font-medium">Cari Laporan Lain</button></div>
                        </div>
                    )}
                  </div>
               </motion.div>
            )}
            
            {view === 'contact' && (
               <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Kontak Dinas Pemberdayaan Perempuan dan Perlindungan Anak</h2><p className="text-slate-500 mb-8 pb-4 border-b border-slate-100">Informasi kontak dan alamat Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Banjarmasin</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"><div className="space-y-4"><h3 className="font-bold text-slate-800 text-lg flex items-center"><MapPin className="w-5 h-5 mr-2 text-slate-500"/> Alamat Kantor</h3><div className="text-slate-600 leading-relaxed pl-7"><p>Dinas Pemberdayaan Perempuan dan Perlindungan Anak</p><p>Jl. Sultan Adam No. 18</p><p>Banjarmasin, Kalimantan Selatan 70122</p></div></div><div className="space-y-4"><h3 className="font-bold text-slate-800 text-lg flex items-center"><Phone className="w-5 h-5 mr-2 text-slate-500"/> Kontak</h3><div className="space-y-2 pl-7"><div className="flex items-center text-slate-600"><span className="w-24 font-medium text-slate-500">Telepon:</span><span>(0511) 3307-788</span></div><div className="flex items-center text-slate-600"><span className="w-24 font-medium text-slate-500">Email:</span><span>dpppa@banjarmasinkota.go.id</span></div><div className="flex items-center text-slate-600"><span className="w-24 font-medium text-slate-500">Website:</span><a href="https://dpppa.banjarmasinkota.go.id" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">dpppa.banjarmasinkota.go.id</a></div></div></div></div>
                  <div className="bg-emerald-50 rounded-lg p-6 mb-4 border border-emerald-100"><h3 className="font-bold text-emerald-800 mb-2 flex items-center"><Clock className="w-5 h-5 mr-2"/> Jam Pelayanan</h3><div className="text-emerald-700 space-y-1 text-sm"><p><span className="font-semibold w-28 inline-block">Senin - Kamis:</span> 08:00 - 16:00 WITA</p><p><span className="font-semibold w-28 inline-block">Jumat:</span> 08:00 - 11:00 WITA</p><p><span className="font-semibold w-28 inline-block">Sabtu - Minggu:</span> Tutup</p></div></div>
                  <div className="bg-red-50 rounded-lg p-6 border border-red-100"><h3 className="font-bold text-red-700 mb-2 flex items-center"><AlertCircle className="w-5 h-5 mr-2"/> Hotline Darurat</h3><div className="text-red-600 text-sm space-y-1"><p>Kekerasan Perempuan & Anak: <span className="font-bold text-lg ml-1">(0511) 3307-999</span></p><p className="text-xs opacity-80">Hotline tersedia 24 jam</p></div></div>
               </motion.div>
            )}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}