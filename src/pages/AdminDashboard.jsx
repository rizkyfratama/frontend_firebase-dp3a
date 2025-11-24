import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { 
  LogOut, LayoutDashboard, FileText, User, Search, Clock, Settings, 
  CheckCircle, XCircle, Menu, Eye, MapPin, BarChart3, Trash2, ArrowLeft, MessageSquare, X, Send, Filter, Calendar, RefreshCcw
} from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [laporan, setLaporan] = useState([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- STATE FILTER BARU ---
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // State Modal Tanggapan
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedLaporanId, setSelectedLaporanId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "laporan"), orderBy("dibuatPada", "desc")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLaporan(data);

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

  const openResponseModal = (id, currentResponse) => {
    setSelectedLaporanId(id);
    setResponseText(currentResponse || '');
    setIsResponseModalOpen(true);
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setLoadingResponse(true);
    try {
        await updateDoc(doc(db, "laporan", selectedLaporanId), {
            tanggapanPetugas: responseText, 
            tanggapanPada: serverTimestamp(),
            status: 'Diproses' 
        });
        alert("Tanggapan berhasil dikirim!");
        setIsResponseModalOpen(false);
    } catch (err) {
        alert("Gagal mengirim tanggapan: " + err.message);
    } finally {
        setLoadingResponse(false);
    }
  };

  // --- LOGIKA FILTER TINGKAT LANJUT ---
  const filteredLaporan = laporan.filter(item => {
    // 1. Filter Pencarian Teks
    const matchesSearch = (item.judul?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (item.nama_pelapor?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (item.lokasi?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    // 2. Filter Status
    const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;

    // Konversi Timestamp Firestore ke Date Object Javascript
    const itemDate = item.dibuatPada ? new Date(item.dibuatPada.seconds * 1000) : new Date();
    const itemYear = itemDate.getFullYear().toString();
    const itemMonth = (itemDate.getMonth() + 1).toString(); // 1-12
    const itemDateStr = itemDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // 3. Filter Tahun
    const matchesYear = filterYear === '' || itemYear === filterYear;

    // 4. Filter Bulan
    const matchesMonth = filterMonth === '' || itemMonth === filterMonth;

    // 5. Filter Tanggal Spesifik
    const matchesDate = filterDate === '' || itemDateStr === filterDate;

    return matchesSearch && matchesStatus && matchesYear && matchesMonth && matchesDate;
  });

  // Reset Semua Filter
  const resetFilters = () => {
    setFilterStatus('Semua');
    setFilterYear('');
    setFilterMonth('');
    setFilterDate('');
    setSearchTerm('');
  };

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
      <aside className={`fixed md:relative z-20 w-64 h-full bg-[#0f172a] text-white flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-xl`}>
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg">P</div>
              <div><span className="block text-white font-bold text-lg leading-none">Portal</span><span className="text-emerald-400 font-bold text-lg leading-none">DP3A</span></div>
           </div>
           <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 font-bold border border-slate-600"><User size={20} /></div>
              <div className="overflow-hidden"><p className="text-white text-sm font-semibold truncate">{user.name || "Petugas"}</p><p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Administrator</p></div>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
          <button onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={20} /><span className="text-sm font-medium">Ringkasan Statistik</span></button>
          <button onClick={() => {setActiveTab('complaints'); setSidebarOpen(false);}} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><FileText size={20} /><span className="text-sm font-medium">Data Pengaduan</span></button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={() => signOut(auth)} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"><LogOut size={20} /><span className="text-sm font-medium">Keluar Sistem</span></button>
        </div>
      </aside>

      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"></div>}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 shadow-sm z-10 text-white">
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-white hover:text-emerald-400"><Menu/></button>
             <div className="flex items-center gap-3">
                <img src="/logo-dp3a.png" alt="Logo" onError={(e) => e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_South_Kalimantan.svg/1200px-Coat_of_arms_of_South_Kalimantan.svg.png"} className="h-10 w-auto object-contain hidden sm:block" />
                <div><h1 className="text-sm font-bold text-white hidden sm:block leading-tight">Dinas Pemberdayaan Perempuan dan Perlindungan Anak</h1><h1 className="text-sm font-bold text-white sm:hidden">Admin Panel DP3A</h1><p className="text-xs text-slate-400 hidden sm:block mt-0.5">Kota Banjarmasin - Panel Manajemen Petugas</p></div>
             </div>
           </div>
           <div className="flex items-center space-x-4"><div className="text-right hidden sm:block"><p className="text-xs text-slate-400">Tanggal Hari Ini</p><p className="text-sm font-bold text-white">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
               <div><h2 className="text-2xl font-bold text-slate-800 mb-1">Ringkasan Statistik</h2><p className="text-slate-500 text-sm">Pantau status laporan pengaduan masyarakat secara real-time.</p></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard title="Total Laporan" count={stats.total} icon={BarChart3} colorBg="bg-slate-800" colorText="text-white" />
                  <StatCard title="Menunggu" count={stats.menunggu} icon={Clock} colorBg="bg-amber-100" colorText="text-amber-600" />
                  <StatCard title="Diproses" count={stats.diproses} icon={Settings} colorBg="bg-blue-100" colorText="text-blue-600" />
                  <StatCard title="Selesai" count={stats.selesai} icon={CheckCircle} colorBg="bg-emerald-100" colorText="text-emerald-600" />
                  <StatCard title="Ditolak" count={stats.ditolak} icon={XCircle} colorBg="bg-red-100" colorText="text-red-600" />
               </div>
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center"><div><h3 className="font-bold text-slate-800 text-lg">Laporan Masuk Terbaru</h3><p className="text-sm text-slate-500">Pengaduan terakhir yang diterima sistem.</p></div><button onClick={() => setActiveTab('complaints')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">Lihat Semua <ArrowLeft className="ml-1 rotate-180" size={16}/></button></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold"><tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Pelapor</th><th className="px-6 py-4">Judul & Lokasi</th><th className="px-6 py-4">Status</th></tr></thead>
                       <tbody className="divide-y divide-slate-100">
                          {laporan.slice(0, 5).map((item) => (
                             <tr key={item.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 text-slate-600 whitespace-nowrap"><div className="flex items-center"><Clock size={14} className="mr-2 text-slate-400"/> {item.tanggalKejadian}</div></td><td className="px-6 py-4"><div className="font-medium text-slate-800">{item.nama_pelapor || "Anonim"}</div><div className="text-xs text-slate-400">{item.emailPelapor}</div></td><td className="px-6 py-4 max-w-xs"><div className="font-bold text-slate-800 truncate">{item.judul}</div><div className="text-xs text-slate-500 flex items-center mt-1"><MapPin size={10} className="mr-1"/> {item.lokasi}</div></td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(item.status)}`}>{item.status || "Menunggu"}</span></td></tr>
                          ))}
                          {laporan.length === 0 && <tr><td colSpan="4" className="text-center py-12 text-slate-400">Belum ada data pengaduan.</td></tr>}
                       </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'complaints' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                     <div><h2 className="text-2xl font-bold text-slate-800 mb-1">Data Pengaduan Masuk</h2><p className="text-slate-500 text-sm">Kelola semua data laporan yang masuk dari masyarakat.</p></div>
                     <button onClick={resetFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center font-bold bg-red-50 px-3 py-2 rounded-lg"><RefreshCcw size={14} className="mr-2"/> Reset Filter</button>
                   </div>

                   {/* --- FILTER BAR (BARU) --- */}
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
                      
                      {/* Search */}
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="Cari Judul, Pelapor..." className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                      </div>

                      {/* Filter Status */}
                      <div className="relative">
                        <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white">
                            <option value="Semua">Semua Status</option>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditolak">Ditolak</option>
                        </select>
                      </div>

                      {/* Filter Tahun & Bulan */}
                      <div className="grid grid-cols-2 gap-2">
                         <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                            <option value="">Tahun</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                         </select>
                         <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                            <option value="">Bulan</option>
                            <option value="1">Januari</option>
                            <option value="2">Februari</option>
                            <option value="3">Maret</option>
                            <option value="4">April</option>
                            <option value="5">Mei</option>
                            <option value="6">Juni</option>
                            <option value="7">Juli</option>
                            <option value="8">Agustus</option>
                            <option value="9">September</option>
                            <option value="10">Oktober</option>
                            <option value="11">November</option>
                            <option value="12">Desember</option>
                         </select>
                      </div>

                      {/* Filter Tanggal Spesifik */}
                      <div className="relative">
                         <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                         <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-500"/>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200"><tr><th className="px-6 py-4 text-center w-16">No</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Pelapor</th><th className="px-6 py-4">Judul & Kategori</th><th className="px-6 py-4">Lokasi</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                           {filteredLaporan.map((item, index) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 text-center text-slate-500">{index + 1}</td>
                                 <td className="px-6 py-4 text-slate-600 whitespace-nowrap"><div className="flex items-center"><Clock size={14} className="mr-2 text-slate-400"/> {item.tanggalKejadian}</div></td>
                                 <td className="px-6 py-4"><div className="font-medium text-slate-800">{item.nama_pelapor || "Anonim"}</div><div className="text-xs text-slate-400">{item.emailPelapor}</div></td>
                                 <td className="px-6 py-4 max-w-xs">
                                    <div className="font-bold text-slate-800">{item.judul}</div>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 uppercase">{item.kategori}</span>
                                    {item.tanggapanPetugas && <div className="mt-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 flex items-center"><MessageSquare size={10} className="mr-1"/> Sudah Ditanggapi</div>}
                                 </td>
                                 <td className="px-6 py-4 text-slate-600"><div className="flex items-center"><MapPin size={14} className="mr-1 text-slate-400"/> {item.lokasi}</div></td>
                                 <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block shadow-sm ${getStatusBadge(item.status)}`}>{item.status || "Menunggu"}</span></td>
                                 <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center space-x-1">
                                          <button onClick={() => openResponseModal(item.id, item.tanggapanPetugas)} title="Beri Tanggapan" className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-500 hover:text-white transition-all"><MessageSquare size={16}/></button>
                                          <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                          <button onClick={() => updateStatus(item.id, 'Diproses')} title="Proses" className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all"><Settings size={16}/></button>
                                          <button onClick={() => updateStatus(item.id, 'Selesai')} title="Selesai" className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
                                          <button onClick={() => updateStatus(item.id, 'Ditolak')} title="Tolak" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all"><XCircle size={16}/></button>
                                          <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                          <button onClick={() => hapusLaporan(item.id)} title="Hapus" className="p-1.5 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {filteredLaporan.length === 0 && <tr><td colSpan="7" className="text-center py-16 text-slate-400 bg-slate-50/50"><div className="flex flex-col items-center"><Search size={32} className="mb-2 opacity-50"/><p>Tidak ada data yang ditemukan.</p></div></td></tr>}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>

      {isResponseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">Beri Tanggapan</h3><button onClick={() => setIsResponseModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button></div>
                <form onSubmit={handleSendResponse}>
                    <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none text-slate-700 mb-4" placeholder="Tulis tanggapan atau tindak lanjut..." required></textarea>
                    <div className="flex justify-end space-x-3"><button type="button" onClick={() => setIsResponseModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Batal</button><button type="submit" disabled={loadingResponse} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md flex items-center">{loadingResponse ? 'Mengirim...' : <><Send size={16} className="mr-2"/> Kirim Tanggapan</>}</button></div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}