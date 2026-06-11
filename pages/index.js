import { useState, useEffect } from "react";
import Head from "next/head";

const ACCESS_KEY = "bagus";

const DEFAULT_ITEMS = [
  { id: 1, nama: "Indomie Goreng", stok: 24, satuan: "bungkus", harga: 3500 },
  { id: 2, nama: "Aqua 600ml", stok: 12, satuan: "botol", harga: 4000 },
  { id: 3, nama: "Rokok Sampoerna", stok: 5, satuan: "bungkus", harga: 25000 },
  { id: 4, nama: "Kopi Sachet", stok: 30, satuan: "sachet", harga: 2000 },
  { id: 5, nama: "Gula Pasir 1kg", stok: 8, satuan: "kg", harga: 14000 },
];

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState(false);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [nextId, setNextId] = useState(6);
  const [showTambah, setShowTambah] = useState(false);
  const [form, setForm] = useState({ nama: "", stok: "", satuan: "", harga: "" });
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("warung_items");
    if (saved) setItems(JSON.parse(saved));
    const savedId = localStorage.getItem("warung_nextid");
    if (savedId) setNextId(parseInt(savedId));
    const savedUnlock = sessionStorage.getItem("warung_unlocked");
    if (savedUnlock === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("warung_items", JSON.stringify(items));
    localStorage.setItem("warung_nextid", String(nextId));
  }, [items, nextId]);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const handleLogin = () => {
    if (keyInput === ACCESS_KEY) {
      setUnlocked(true);
      sessionStorage.setItem("warung_unlocked", "1");
      setKeyError(false);
    } else {
      setKeyError(true);
      setTimeout(() => setKeyError(false), 1000);
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    sessionStorage.removeItem("warung_unlocked");
    setKeyInput("");
  };

  const handleTambahStok = (id, jumlah) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, stok: Math.max(0, item.stok + jumlah) } : item
      )
    );
    const item = items.find(i => i.id === id);
    if (item) {
      const label = jumlah > 0 ? `+${jumlah}` : `${jumlah}`;
      showNotif(`${item.nama} stok ${label} → ${Math.max(0, item.stok + jumlah)} ${item.satuan}`);
    }
  };

  const handleHapus = (id) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDelete(null);
    showNotif(`${item.nama} dihapus dari daftar`, "delete");
  };

  const handleTambahBarang = () => {
    if (!form.nama.trim()) return setFormError("Nama barang wajib diisi");
    if (!form.stok || isNaN(form.stok) || Number(form.stok) < 0) return setFormError("Stok harus berupa angka");
    if (!form.satuan.trim()) return setFormError("Satuan wajib diisi");
    const newItem = {
      id: nextId,
      nama: form.nama.trim(),
      stok: parseInt(form.stok),
      satuan: form.satuan.trim(),
      harga: parseInt(form.harga) || 0,
    };
    setItems(prev => [...prev, newItem]);
    setNextId(prev => prev + 1);
    setForm({ nama: "", stok: "", satuan: "", harga: "" });
    setShowTambah(false);
    setFormError("");
    showNotif(`${newItem.nama} berhasil ditambahkan!`);
  };

  const filtered = items.filter(item =>
    item.nama.toLowerCase().includes(searchQ.toLowerCase())
  );

  const stokRendah = items.filter(i => i.stok <= 5 && i.stok > 0).length;
  const stokHabis = items.filter(i => i.stok === 0).length;

  if (!unlocked) {
    return (
      <>
        <Head><title>Warung Bagus</title></Head>
        <style>{globalStyle}</style>
        <div className="login-bg">
          <div className={`login-card ${keyError ? "shake" : ""}`}>
            <div className="login-logo">🏪</div>
            <h1 className="login-title">Warung Bagus</h1>
            <p className="login-sub">Masukkan kunci akses untuk lanjut</p>
            <input
              className={`login-input ${keyError ? "error" : ""}`}
              type="password"
              placeholder="Kunci akses..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoFocus
            />
            {keyError && <p className="login-err">❌ Kunci salah, coba lagi</p>}
            <button className="btn-primary" onClick={handleLogin}>Masuk</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Warung Bagus – Stok</title></Head>
      <style>{globalStyle}</style>

      {notification && (
        <div className={`notif notif-${notification.type}`}>
          {notification.type === "delete" ? "🗑️" : "✅"} {notification.msg}
        </div>
      )}

      {confirmDelete && (
        <div className="overlay">
          <div className="dialog">
            <p className="dialog-title">Hapus barang ini?</p>
            <p className="dialog-sub">
              <strong>{items.find(i => i.id === confirmDelete)?.nama}</strong> akan dihapus dari daftar.
            </p>
            <div className="dialog-actions">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Batal</button>
              <button className="btn-danger" onClick={() => handleHapus(confirmDelete)}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <span className="header-logo">🏪</span>
            <span className="header-title">Warung Bagus</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Keluar</button>
        </header>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{items.length}</span>
            <span className="stat-label">Total Barang</span>
          </div>
          <div className={`stat-card ${stokRendah > 0 ? "warn" : ""}`}>
            <span className="stat-num">{stokRendah}</span>
            <span className="stat-label">Stok Menipis</span>
          </div>
          <div className={`stat-card ${stokHabis > 0 ? "danger" : ""}`}>
            <span className="stat-num">{stokHabis}</span>
            <span className="stat-label">Stok Habis</span>
          </div>
        </div>

        {/* Search + Tambah */}
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="🔍 Cari barang..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          <button className="btn-primary btn-add" onClick={() => setShowTambah(true)}>
            + Tambah
          </button>
        </div>

        {/* Form Tambah Barang */}
        {showTambah && (
          <div className="form-card">
            <h3 className="form-title">Tambah Barang Baru</h3>
            {formError && <p className="form-err">⚠️ {formError}</p>}
            <div className="form-grid">
              <div className="form-group">
                <label>Nama Barang</label>
                <input
                  className="form-input"
                  placeholder="cth: Teh Botol"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Stok Awal</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stok}
                  onChange={e => setForm(f => ({ ...f, stok: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Satuan</label>
                <input
                  className="form-input"
                  placeholder="cth: botol, bungkus"
                  value={form.satuan}
                  onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Harga Jual (Rp)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.harga}
                  onChange={e => setForm(f => ({ ...f, harga: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-ghost" onClick={() => { setShowTambah(false); setFormError(""); }}>Batal</button>
              <button className="btn-primary" onClick={handleTambahBarang}>Simpan Barang</button>
            </div>
          </div>
        )}

        {/* Item List */}
        <div className="item-list">
          {filtered.length === 0 && (
            <div className="empty">
              <p>🛒 {searchQ ? "Barang tidak ditemukan" : "Belum ada barang"}</p>
            </div>
          )}
          {filtered.map(item => {
            const statusClass = item.stok === 0 ? "habis" : item.stok <= 5 ? "tipis" : "oke";
            return (
              <div key={item.id} className={`item-card item-${statusClass}`}>
                <div className="item-info">
                  <span className="item-nama">{item.nama}</span>
                  <span className="item-harga">
                    {item.harga > 0 ? `Rp ${item.harga.toLocaleString("id-ID")}` : "—"}
                  </span>
                </div>
                <div className="item-bottom">
                  <div className="stok-badge-wrap">
                    <span className={`stok-badge badge-${statusClass}`}>
                      {item.stok === 0 ? "Habis" : item.stok <= 5 ? "⚠️ Menipis" : "✓ Ada"}
                    </span>
                    <span className="stok-num">{item.stok} {item.satuan}</span>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-stok btn-minus"
                      onClick={() => handleTambahStok(item.id, -1)}
                      disabled={item.stok === 0}
                      title="Laku / kurangi"
                    >−</button>
                    <button
                      className="btn-stok btn-plus"
                      onClick={() => handleTambahStok(item.id, +1)}
                      title="Tambah stok"
                    >+</button>
                    <button
                      className="btn-stok btn-plus5"
                      onClick={() => handleTambahStok(item.id, +5)}
                      title="Tambah 5"
                    >+5</button>
                    <button
                      className="btn-hapus"
                      onClick={() => setConfirmDelete(item.id)}
                      title="Hapus barang"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="footer">Warung Bagus © {new Date().getFullYear()}</footer>
      </div>
    </>
  );
}

const globalStyle = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --hijau: #2d6a4f;
    --hijau-mid: #40916c;
    --hijau-light: #d8f3dc;
    --hijau-pale: #f0faf2;
    --coklat: #774936;
    --coklat-light: #ffe8d6;
    --kuning: #f4a261;
    --merah: #e05c5c;
    --merah-light: #fdeaea;
    --abu: #6c757d;
    --abu-light: #f4f5f6;
    --putih: #ffffff;
    --teks: #1a2e24;
    --shadow: 0 2px 8px rgba(0,0,0,0.09);
    --radius: 12px;
  }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--hijau-pale);
    color: var(--teks);
    min-height: 100vh;
    font-size: 15px;
  }

  /* LOGIN */
  .login-bg {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%);
    padding: 20px;
  }
  .login-card {
    background: white;
    border-radius: 20px;
    padding: 40px 32px;
    width: 100%;
    max-width: 360px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    transition: transform 0.1s;
  }
  .login-card.shake { animation: shake 0.4s; }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  .login-logo { font-size: 52px; margin-bottom: 12px; display: block; }
  .login-title { font-size: 26px; font-weight: 800; color: var(--hijau); margin-bottom: 6px; }
  .login-sub { color: var(--abu); font-size: 14px; margin-bottom: 24px; }
  .login-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 16px;
    margin-bottom: 8px;
    outline: none;
    transition: border 0.2s;
    letter-spacing: 3px;
  }
  .login-input:focus { border-color: var(--hijau-mid); }
  .login-input.error { border-color: var(--merah); background: var(--merah-light); }
  .login-err { color: var(--merah); font-size: 13px; margin-bottom: 12px; }

  /* APP */
  .app { max-width: 600px; margin: 0 auto; padding: 0 12px 40px; }

  .header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--hijau);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    margin: 0 -12px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-logo { font-size: 24px; }
  .header-title { font-size: 20px; font-weight: 800; letter-spacing: -0.3px; }
  .btn-logout {
    background: rgba(255,255,255,0.18);
    color: white;
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-logout:hover { background: rgba(255,255,255,0.28); }

  /* STATS */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  .stat-card {
    background: white;
    border-radius: var(--radius);
    padding: 14px 10px;
    text-align: center;
    box-shadow: var(--shadow);
    border-top: 3px solid var(--hijau-mid);
  }
  .stat-card.warn { border-top-color: var(--kuning); }
  .stat-card.danger { border-top-color: var(--merah); }
  .stat-num { display: block; font-size: 28px; font-weight: 900; color: var(--teks); line-height: 1; }
  .stat-label { display: block; font-size: 11px; color: var(--abu); margin-top: 4px; }

  /* TOOLBAR */
  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }
  .search-input {
    flex: 1;
    padding: 11px 14px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    background: white;
    outline: none;
    transition: border 0.2s;
  }
  .search-input:focus { border-color: var(--hijau-mid); }

  /* BUTTONS */
  .btn-primary {
    background: var(--hijau);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 11px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: var(--hijau-mid); }
  .btn-primary:active { transform: scale(0.97); }
  .btn-ghost {
    background: transparent;
    color: var(--abu);
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 11px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-danger {
    background: var(--merah);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 11px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  /* FORM TAMBAH */
  .form-card {
    background: white;
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: var(--shadow);
    border-left: 4px solid var(--hijau-mid);
  }
  .form-title { font-size: 16px; font-weight: 800; color: var(--hijau); margin-bottom: 14px; }
  .form-err { color: var(--merah); font-size: 13px; background: var(--merah-light); padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-size: 12px; font-weight: 700; color: var(--abu); text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input {
    padding: 10px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border 0.2s;
  }
  .form-input:focus { border-color: var(--hijau-mid); }
  .form-actions { display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end; }

  /* ITEM LIST */
  .item-list { display: flex; flex-direction: column; gap: 10px; }
  .empty { text-align: center; padding: 40px; color: var(--abu); font-size: 15px; }

  .item-card {
    background: white;
    border-radius: var(--radius);
    padding: 14px 16px;
    box-shadow: var(--shadow);
    border-left: 4px solid var(--hijau-mid);
    transition: transform 0.1s;
  }
  .item-card:hover { transform: translateY(-1px); }
  .item-card.item-tipis { border-left-color: var(--kuning); background: #fffdf5; }
  .item-card.item-habis { border-left-color: var(--merah); background: #fff8f8; }

  .item-info { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .item-nama { font-size: 16px; font-weight: 700; color: var(--teks); }
  .item-harga { font-size: 13px; color: var(--hijau-mid); font-weight: 600; background: var(--hijau-light); padding: 2px 8px; border-radius: 6px; }

  .item-bottom { display: flex; align-items: center; justify-content: space-between; }
  .stok-badge-wrap { display: flex; align-items: center; gap: 8px; }
  .stok-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
  .badge-oke { background: var(--hijau-light); color: var(--hijau); }
  .badge-tipis { background: #fff3cd; color: #856404; }
  .badge-habis { background: var(--merah-light); color: var(--merah); }
  .stok-num { font-size: 14px; font-weight: 600; color: var(--abu); }

  .item-actions { display: flex; gap: 6px; align-items: center; }
  .btn-stok {
    border: none;
    border-radius: 7px;
    width: 34px;
    height: 34px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-stok:active { transform: scale(0.92); }
  .btn-minus { background: var(--coklat-light); color: var(--coklat); }
  .btn-minus:hover { background: #ffd5bb; }
  .btn-minus:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-plus { background: var(--hijau-light); color: var(--hijau); }
  .btn-plus:hover { background: #b7e4c7; }
  .btn-plus5 { width: auto; padding: 0 10px; font-size: 12px; background: var(--hijau-light); color: var(--hijau); }
  .btn-plus5:hover { background: #b7e4c7; }
  .btn-hapus {
    background: var(--merah-light);
    border: none;
    border-radius: 7px;
    width: 34px; height: 34px;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-hapus:hover { background: #f9c0c0; }

  /* NOTIFIKASI */
  .notif {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--hijau);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    z-index: 999;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
    white-space: nowrap;
    max-width: 90vw;
  }
  .notif-delete { background: var(--merah); }
  @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* DIALOG */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .dialog {
    background: white;
    border-radius: 16px;
    padding: 28px 24px;
    max-width: 340px;
    width: 100%;
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    text-align: center;
  }
  .dialog-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .dialog-sub { font-size: 14px; color: var(--abu); margin-bottom: 24px; }
  .dialog-actions { display: flex; gap: 10px; justify-content: center; }

  .footer { text-align: center; color: var(--abu); font-size: 12px; margin-top: 32px; }

  @media (max-width: 420px) {
    .form-grid { grid-template-columns: 1fr; }
    .item-actions { gap: 5px; }
    .btn-stok { width: 30px; height: 30px; font-size: 14px; }
  }
`;
