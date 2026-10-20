// ====== KONFIGURASI ======
// Isi SUPABASE_URL dan SUPABASE_KEY (anon public key) dari Supabase > Project Settings > API.
// Jika dikosongkan, aplikasi berjalan dalam MODE LOKAL (data hanya di browser PC itu,
// pengumuman rekaman dari HP tidak berfungsi).
window.BEL_CONFIG = {
  SUPABASE_URL: "https://hudeudlgdhbegugetwtj.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGV1ZGxnZGhiZWd1Z2V0d3RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQ3MzA4MiwiZXhwIjoyMTA4MDQ5MDgyfQ.RK2pQOnhzH7XblTNSeJ0V4P49EWyrwJtGjJv5AhVkQU",
  // Kode unik ruang siaran langsung. WAJIB diganti dengan kode acak milik Anda
  // (huruf/angka/tanda minus, tanpa spasi), mis. "pesantren-x7k2q9".
  ROOM: "ruasa-123",
  // PIN untuk membuka halaman pengumuman di HP.
  PIN: "1234"
};
