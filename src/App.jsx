import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { 
  getAuth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  User, 
  Search, 
  Clock, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Menu,
  Eye,
  Send,
  MapPin,
  AlertCircle,
  Phone,
  Grid,
  Home,
  ArrowLeft,
  MoreHorizontal,
  BarChart3,
  Trash2
} from 'lucide-react';

// ==========================================
// [SECTION 0] KONFIGURASI FIREBASE
// ==========================================
// Menggunakan konfigurasi asli milik Anda
const firebaseConfig = {
  apiKey: "AIzaSyA_717QoIkhbnoqjBaHNytJq8U1SXZ5o30",
  authDomain: "pengaduan-dpppa-bjm.firebaseapp.com",
  projectId: "pengaduan-dpppa-bjm",
  storageBucket: "pengaduan-dpppa-bjm.firebasestorage.app",
  messagingSenderId: "177772980316",
  appId: "1:177772980316:web:e1fa0abb1fc036425a5e99"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// [SECTION 1] LOGIN
// ==========================================
function Login({ onSwitchToRegister }) {
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
      console.error(err);
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold text-2xl shadow-lg">DP3A</div>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Sistem Pengaduan</h1>
          <p className="text-slate-500 text-sm">Masuk untuk melanjutkan</p>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <div>{error}</div>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="nama@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="••••••••" required />
          </div>
          <button disabled={loading} type="submit" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md transition transform active:scale-95">
            {loading ? 'Memuat...' : 'MASUK'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun? <button onClick={onSwitchToRegister} className="font-bold text-emerald-600 hover:underline">Daftar Sekarang</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// [SECTION 2] REGISTER
// ==========================================
function Register({ onSwitchToLogin }) {
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
      
      // Logika Auto-Role: Jika email mengandung kata 'petugas' atau 'admin', set role jadi admin
      const isPetugas = formData.email.toLowerCase().includes('petugas') || formData.email.toLowerCase().includes('admin');
      const role = isPetugas ? 'admin' : 'Masyarakat'; // Sesuaikan dengan format di DB lama Anda (CamelCase / Lowercase)

      // Simpan ke collection "users" di root (sesuai kode lama Anda)
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 my-8">
        <h2 className="text-2xl font-bold text-center text-emerald-600 mb-2">Buat Akun Baru</h2>
        <p className="text-center text-slate-500 text-sm mb-6">Bergabung untuk layanan pengaduan</p>
        
        {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-600">Nama</label><input name="nama" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
            <div><label className="text-xs font-bold text-slate-600">NIK</label><input name="nik" type="number" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-600">Email</label><input name="email" type="email" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
            <div><label className="text-xs font-bold text-slate-600">No HP</label><input name="noHp" type="number" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-600">Password</label><input name="password" type="password" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
          <div><label className="text-xs font-bold text-slate-600">Konfirmasi Password</label><input name="confirm" type="password" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
          
          <button disabled={loading} type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md mt-2">
            {loading ? 'Memproses...' : 'DAFTAR'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun? <button onClick={onSwitchToLogin} className="font-bold text-emerald-600 hover:underline">Masuk</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// [SECTION 3] ADMIN DASHBOARD (Petugas)
// ==========================================
function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [laporan, setLaporan] = useState([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Menggunakan collection "laporan" langsung di root (sesuai kode lama Anda)
    const q = query(collection(db, "laporan"), orderBy("dibuatPada", "desc")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLaporan(data);

      // Hitung Statistik
      const counts = { total: 0, menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 };
      data.forEach(item => {
        counts.total++;
        const status = item.status ? item.status.toLowerCase() : 'menunggu';
        if (status === 'menunggu') counts.menunggu++;
        else if (status === 'diproses') counts.diproses++;
        else if (status === 'selesai') counts.selesai++;
        else if (status === 'ditolak') counts.ditolak++;
      });
      setStats(counts);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    if (window.confirm(`Ubah status laporan ini menjadi ${newStatus}?`)) {
      await updateDoc(doc(db, "laporan", id), { status: newStatus });
    }
  };

  const hapusLaporan = async (id) => {
    if (window.confirm('PERINGATAN: Laporan akan dihapus permanen. Lanjutkan?')) {
      try {
        await deleteDoc(doc(db, "laporan", id));
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  const filteredLaporan = laporan.filter(item => 
    (item.judul?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.nama_pelapor?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.lokasi?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, count, icon: Icon, colorBg, colorText }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center transform transition hover:scale-105">
      <div className={`p-3 rounded-lg mr-4 ${colorBg} ${colorText} shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-2xl font-bold text-slate-800">{count}</h4>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'menunggu';
    switch(s) {
      case 'selesai': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'diproses': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'ditolak': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR ADMIN */}
      <aside className={`fixed md:relative z-20 w-64 h-full bg-slate-900 text-white flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-xl`}>
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg">P</div>
              <div>
                <span className="block text-white font-bold text-lg leading-none">Portal</span>
                <span className="text-emerald-400 font-bold text-lg leading-none">DP3A</span>
              </div>
           </div>
           <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold border border-slate-600">
                 <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-semibold truncate">{user.name || "Petugas"}</p>
                <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Administrator</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
          <button 
            onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false);}}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">Ringkasan Statistik</span>
          </button>
          <button 
            onClick={() => {setActiveTab('complaints'); setSidebarOpen(false);}}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText size={20} />
            <span className="text-sm font-medium">Data Pengaduan</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={() => signOut(auth)} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-medium">Keluar Sistem</span>
           </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
           <div className="flex items-center">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 text-slate-500 hover:text-emerald-600"><Menu/></button>
             <div>
                <h1 className="text-sm font-bold text-slate-800 hidden sm:block">Dinas Pemberdayaan Perempuan dan Perlindungan Anak</h1>
                <h1 className="text-sm font-bold text-slate-800 sm:hidden">Admin Panel DP3A</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Kota Banjarmasin - Panel Manajemen Petugas</p>
             </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                 <p className="text-xs text-slate-500">Tanggal Hari Ini</p>
                 <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          
          {/* TAB: DASHBOARD STATISTIK */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-1">Ringkasan Statistik</h2>
                 <p className="text-slate-500 text-sm">Pantau status laporan pengaduan masyarakat secara real-time.</p>
               </div>

               {/* Statistik Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard title="Total Laporan" count={stats.total} icon={BarChart3} colorBg="bg-slate-800" colorText="text-white" />
                  <StatCard title="Menunggu" count={stats.menunggu} icon={Clock} colorBg="bg-amber-100" colorText="text-amber-600" />
                  <StatCard title="Diproses" count={stats.diproses} icon={Settings} colorBg="bg-blue-100" colorText="text-blue-600" />
                  <StatCard title="Selesai" count={stats.selesai} icon={CheckCircle} colorBg="bg-emerald-100" colorText="text-emerald-600" />
                  <StatCard title="Ditolak" count={stats.ditolak} icon={XCircle} colorBg="bg-red-100" colorText="text-red-600" />
               </div>

               {/* Tabel Pratinjau (5 Terbaru) */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Laporan Masuk Terbaru</h3>
                      <p className="text-sm text-slate-500">Pengaduan terakhir yang diterima sistem.</p>
                    </div>
                    <button onClick={() => setActiveTab('complaints')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                      Lihat Semua <ArrowLeft className="ml-1 rotate-180" size={16}/>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                          <tr>
                             <th className="px-6 py-4">Tanggal</th>
                             <th className="px-6 py-4">Pelapor</th>
                             <th className="px-6 py-4">Judul & Lokasi</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-right">Aksi</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {laporan.slice(0, 5).map((item) => (
                             <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                  <div className="flex items-center"><Clock size={14} className="mr-2 text-slate-400"/> {item.tanggalKejadian}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-slate-800">{item.nama_pelapor || "Anonim"}</div>
                                  <div className="text-xs text-slate-400">{item.emailPelapor}</div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="font-bold text-slate-800 truncate">{item.judul}</div>
                                  <div className="text-xs text-slate-500 flex items-center mt-1"><MapPin size={10} className="mr-1"/> {item.lokasi}</div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(item.status)}`}>
                                      {item.status || "Menunggu"}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button onClick={() => {setSearchTerm(item.judul); setActiveTab('complaints');}} className="text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-xs transition-all font-medium inline-flex items-center">
                                      <Eye size={14} className="mr-1.5"/> Detail
                                   </button>
                                </td>
                             </tr>
                          ))}
                          {laporan.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-12 text-slate-400">Belum ada data pengaduan.</td></tr>
                          )}
                       </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: SEMUA LAPORAN (MANAJEMEN PENGADUAN) */}
          {activeTab === 'complaints' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-1">Data Pengaduan Masuk</h2>
                     <p className="text-slate-500 text-sm">Kelola semua data laporan yang masuk dari masyarakat.</p>
                   </div>
                   <div className="relative group">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Cari Judul, Nama Pelapor..." 
                        className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full md:w-80 text-sm transition-all shadow-sm"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-4 text-center w-16">No</th>
                              <th className="px-6 py-4">Tanggal</th>
                              <th className="px-6 py-4">Pelapor</th>
                              <th className="px-6 py-4">Judul & Kategori</th>
                              <th className="px-6 py-4">Lokasi</th>
                              <th className="px-6 py-4 text-center">Status</th>
                              <th className="px-6 py-4 text-center">Aksi</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {filteredLaporan.map((item, index) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 text-center text-slate-500">{index + 1}</td>
                                 <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                    <div className="flex items-center"><Clock size={14} className="mr-2 text-slate-400"/> {item.tanggalKejadian}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{item.nama_pelapor || "Anonim"}</div>
                                    <div className="text-xs text-slate-400">{item.emailPelapor}</div>
                                 </td>
                                 <td className="px-6 py-4 max-w-xs">
                                    <div className="font-bold text-slate-800">{item.judul}</div>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 uppercase">
                                      {item.kategori}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center"><MapPin size={14} className="mr-1 text-slate-400"/> {item.lokasi}</div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block shadow-sm ${getStatusBadge(item.status)}`}>
                                       {item.status || "Menunggu"}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center space-x-1">
                                       <button onClick={() => updateStatus(item.id, 'Diproses')} title="Proses" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all"><Settings size={16}/></button>
                                       <button onClick={() => updateStatus(item.id, 'Selesai')} title="Selesai" className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
                                       <button onClick={() => updateStatus(item.id, 'Ditolak')} title="Tolak" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all"><XCircle size={16}/></button>
                                       <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                       <button onClick={() => hapusLaporan(item.id)} title="Hapus" className="p-1.5 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {filteredLaporan.length === 0 && (
                             <tr><td colSpan="7" className="text-center py-16 text-slate-400 bg-slate-50/50">
                               <div className="flex flex-col items-center">
                                 <Search size={32} className="mb-2 opacity-50"/>
                                 <p>Tidak ada data yang ditemukan.</p>
                               </div>
                             </td></tr>
                           )}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// [SECTION 4] USER HOME
// ==========================================
function UserHome({ user }) {
  const [view, setView] = useState('home'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, diproses: 0, selesai: 0 });
  const [form, setForm] = useState({ judul: '', kategori: 'Kekerasan Fisik', lokasi: '', kronologi: '', tanggal: '' });

  useEffect(() => {
     if (!user || !user.uid) return;
     const q = query(collection(db, "laporan"), where("userId", "==", user.uid));
     const unsubscribe = onSnapshot(q, (snapshot) => {
        const total = snapshot.size;
        const selesai = snapshot.docs.filter(d => d.data().status === 'Selesai').length;
        const diproses = total - selesai;
        setStats({ total, diproses, selesai });
     });
     return () => unsubscribe();
  }, [user]);

  const kirimLaporan = async (e) => {
    e.preventDefault();
    try {
      if(!form.tanggal) { alert("Mohon isi tanggal!"); return; }
      const [y, m, d] = form.tanggal.split('-');
      
      await addDoc(collection(db, "laporan"), {
        userId: user.uid,
        emailPelapor: user.email, 
        tanggalKejadian: `${d}/${m}/${y}`,
        ...form,
        status: "Menunggu",
        nama_pelapor: user.name || user.email, 
        dibuatPada: serverTimestamp(), 
      });
      alert('Laporan Terkirim!');
      setForm({ judul: '', kategori: 'Kekerasan Fisik', lokasi: '', kronologi: '', tanggal: '' });
      setView('home');
    } catch (err) { alert('Gagal: ' + err.message); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className={`fixed md:relative z-20 w-64 h-full bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold"><User size={20} /></div>
          <div className="overflow-hidden"><p className="text-white text-sm font-semibold truncate w-32">{user.name}</p><p className="text-xs text-slate-500">Masyarakat</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => {setView('home'); setSidebarOpen(false);}} className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 ${view === 'home' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><Home size={18} className="mr-3"/><span className="text-sm">Beranda</span></button>
          <button onClick={() => {setView('form'); setSidebarOpen(false);}} className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 ${view === 'form' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><FileText size={18} className="mr-3"/><span className="text-sm">Buat Pengaduan</span></button>
          <button onClick={() => {setView('history'); setSidebarOpen(false);}} className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 ${view === 'history' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><Search size={18} className="mr-3"/><span className="text-sm">Lacak Pengaduan</span></button>
          <button onClick={() => {setView('contact'); setSidebarOpen(false);}} className={`w-full flex items-center px-4 py-3 rounded-lg ${view === 'contact' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><Phone size={18} className="mr-3"/><span className="text-sm">Kontak Dinas</span></button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={() => signOut(auth)} className="w-full flex items-center px-2 text-slate-400 hover:text-red-400 transition"><LogOut size={18} className="mr-2"/> Logout</button></div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-10 md:bg-white md:text-slate-800 md:border-b md:border-slate-200">
           <div className="flex items-center"><button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 text-current"><Menu/></button><div><h1 className="text-sm font-bold">DP3A Kota Banjarmasin</h1></div></div>
           <div className="hidden md:flex items-center"><div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center mr-2"><User size={16}/></div><span className="text-xs font-bold">{user.name}</span></div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {view === 'home' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
               <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-slate-200">
                  <h2 className="text-2xl font-bold text-emerald-700 mb-2">Layanan Pengaduan Masyarakat</h2>
                  <p className="text-slate-500 mb-8 max-w-2xl mx-auto">Laporkan kasus kekerasan terhadap perempuan dan anak secara aman dan rahasia.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                     <div className="bg-emerald-50 p-6 rounded-xl flex flex-col items-center"><div className="h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">1</div><h3 className="font-bold text-slate-800 mb-1">Sampaikan Laporan</h3></div>
                     <div className="bg-emerald-50 p-6 rounded-xl flex flex-col items-center"><div className="h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">2</div><h3 className="font-bold text-slate-800 mb-1">Proses Verifikasi</h3></div>
                     <div className="bg-emerald-50 p-6 rounded-xl flex flex-col items-center"><div className="h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">3</div><h3 className="font-bold text-slate-800 mb-1">Tindak Lanjut</h3></div>
                  </div>
                  <button onClick={() => setView('form')} className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center justify-center mx-auto"><FileText size={18} className="mr-2"/> Buat Pengaduan Baru</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center"><div className="inline-block p-2 bg-blue-50 text-blue-600 rounded-full mb-2"><FileText size={20}/></div><div className="text-2xl font-bold text-slate-800">{stats.total}</div><div className="text-xs text-slate-500">Total</div></div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center"><div className="inline-block p-2 bg-yellow-50 text-yellow-600 rounded-full mb-2"><Clock size={20}/></div><div className="text-2xl font-bold text-slate-800">{stats.diproses}</div><div className="text-xs text-slate-500">Diproses</div></div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center"><div className="inline-block p-2 bg-green-50 text-green-600 rounded-full mb-2"><CheckCircle size={20}/></div><div className="text-2xl font-bold text-slate-800">{stats.selesai}</div><div className="text-xs text-slate-500">Selesai</div></div>
               </div>
            </div>
          )}

          {view === 'form' && (
            <div className="max-w-3xl mx-auto animate-slide-up">
               <button onClick={() => setView('home')} className="mb-4 flex items-center text-slate-500 hover:text-emerald-600 font-bold text-sm"><ArrowLeft size={16} className="mr-1"/> Kembali</button>
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4"><Send className="text-emerald-600 mr-3"/> Formulir Pengaduan</h2>
                  <form onSubmit={kirimLaporan} className="space-y-5">
                     <div><label className="text-xs font-bold text-slate-600 uppercase">Judul Laporan</label><input value={form.judul} onChange={e=>setForm({...form, judul:e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="text-xs font-bold text-slate-600 uppercase">Tanggal Kejadian</label><input type="date" value={form.tanggal} onChange={e=>setForm({...form, tanggal:e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" required /></div>
                        <div><label className="text-xs font-bold text-slate-600 uppercase">Kategori</label><select value={form.kategori} onChange={e=>setForm({...form, kategori:e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"><option>Kekerasan Fisik</option><option>Kekerasan Seksual</option><option>Penelantaran</option><option>Kekerasan Psikis</option><option>Lainnya</option></select></div>
                     </div>
                     <div><label className="text-xs font-bold text-slate-600 uppercase">Lokasi Kejadian</label><input value={form.lokasi} onChange={e=>setForm({...form, lokasi:e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-lg" required /></div>
                     <div><label className="text-xs font-bold text-slate-600 uppercase">Kronologi</label><textarea value={form.kronologi} onChange={e=>setForm({...form, kronologi:e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-lg h-32" required></textarea></div>
                     <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg mt-4">KIRIM LAPORAN</button>
                  </form>
               </div>
            </div>
          )}
          
          {view === 'history' && <div className="text-center py-20"><Search size={48} className="mx-auto mb-4 text-emerald-200"/><h2 className="text-xl font-bold text-slate-400">Riwayat Pengaduan</h2><p className="text-slate-400">Belum ada riwayat yang dapat ditampilkan.</p></div>}
          {view === 'contact' && <div className="text-center py-20"><Phone size={48} className="mx-auto mb-4 text-emerald-200"/><h2 className="text-xl font-bold text-slate-400">Kontak Dinas</h2><p className="text-slate-400">Hubungi Call Center: 0812-3456-7890</p></div>}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// [SECTION 5] MAIN APP & ROUTING
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Ambil data user langsung dari 'users' collection di root
          const docSnap = await getDoc(doc(db, "users", authUser.uid));
          if (docSnap.exists()) {
            setUser(docSnap.data());
          } else {
            const email = authUser.email.toLowerCase();
            const isPetugas = email.includes('admin') || email.includes('petugas');
            setUser({ 
              email: authUser.email, 
              role: isPetugas ? 'admin' : 'masyarakat', 
              uid: authUser.uid, 
              name: isPetugas ? 'Petugas' : (authUser.displayName || 'User Baru') 
            });
          }
        } catch (error) {
          console.error("Error mengambil data user:", error);
          setUser({ email: authUser.email, role: 'masyarakat', uid: authUser.uid });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  if (!user) return isRegistering ? <Register onSwitchToLogin={() => setIsRegistering(false)} /> : <Login onSwitchToRegister={() => setIsRegistering(true)} />;

  const role = user.role ? user.role.toLowerCase() : '';
  const isAdmin = role === 'admin' || user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('petugas');

  return isAdmin ? <AdminDashboard user={user} /> : <UserHome user={user} />;
}