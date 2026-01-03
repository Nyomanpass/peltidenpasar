import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Fungsi Warna Berdasarkan ID menggunakan HSL agar warna tidak terbatas dan tetap unik
const getBaganColor = (baganId) => {
  if (!baganId) return '#999999';

  // Golden Angle (137.5) memastikan distribusi warna yang merata pada lingkaran warna
  const hue = (parseInt(baganId) * 137.5) % 360; 
  
  // Saturation 70% dan Lightness 45% agar warna cerah dan teks putih tetap kontras
  return `hsl(${hue}, 70%, 45%)`;
};

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff' },
  title: { fontSize: 16, marginBottom: 5, textAlign: 'center', fontWeight: 'bold' },
  subtitle: { fontSize: 10, marginBottom: 20, textAlign: 'center', color: '#666' },
  
  table: { 
    display: 'table', 
    width: 'auto', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0 
  },
  
  tableRow: { flexDirection: 'row' },
  
  tableColHeader: { 
    width: '20%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  
  tableCol: { 
    width: '20%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 110 // Tinggi ditambah agar muat dengan font yang lebih besar
  },
  
  tableCellHeader: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  
  // Font Peserta diubah menjadi 14
  tableCellPeserta: { 
    fontSize: 11, 
    textAlign: 'center', 
    paddingHorizontal: 4,
    fontWeight: 'bold'
  },

  // Font "vs" diubah menjadi 10
  textVs: {
    fontSize: 10,
    color: '#999',
    marginVertical: 4,
    textAlign: 'center'
  },

  baganLabel: { 
    fontSize: 8, 
    fontWeight: 'bold', 
    paddingVertical: 2, 
    paddingHorizontal: 8, 
    marginBottom: 8, 
    borderRadius: 3, 
    color: '#ffffff', 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  
  timeCell: { backgroundColor: '#f9f9f9' },
  
  // Font Jam diubah menjadi 14
  timeText: { 
    fontSize: 14, 
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

const JadwalPDF = ({ jadwal = [], lapanganList = [], selectedTanggal, tournamentName }) => {
  const validJadwal = (jadwal || []).filter(j => j.waktuMulai && j.lapangan?.nama);
  
  if (validJadwal.length === 0) {
    return (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <Text style={{ textAlign: 'center', marginTop: 50 }}>Tidak ada data jadwal tersedia.</Text>
        </Page>
      </Document>
    );
  }

  const allHours = [...new Set(validJadwal.map(j => j.waktuMulai.slice(11, 16)))].sort();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>JADWAL PERTANDINGAN {tournamentName?.toUpperCase()}</Text>
        <Text style={styles.subtitle}>Tanggal: {selectedTanggal || 'Semua Tanggal'}</Text>

        <View style={styles.table}>
          {/* Header Tabel */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>JAM</Text></View>
            {lapanganList.map((lap) => (
              <View key={lap} style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>{lap.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {/* Isi Tabel Per Jam */}
          {allHours.map((jam) => (
            <View key={jam} style={styles.tableRow}>
              {/* Kolom Jam (Font 14) */}
              <View style={[styles.tableCol, styles.timeCell]}>
                <Text style={styles.timeText}>{jam}</Text>
              </View>

              {/* Kolom Lapangan */}
                {lapanganList.map((lapName) => {
                  const matchData = validJadwal.find(j => 
                      j.waktuMulai.slice(11, 16) === jam && 
                      j.lapangan?.nama === lapName
                  );

                  const bName = matchData?.match?.bagan?.nama || '';
                  const bId = matchData?.match?.bagan?.id || 0;
                  const bColor = getBaganColor(bId);

                  return (
                    <View key={lapName} style={styles.tableCol}>
                      {matchData ? (
                        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 5 }}>
                          {/* Label Nama Bagan */}
                          <View style={[styles.baganLabel, { backgroundColor: bColor }]}>
                            <Text>{bName}</Text>
                          </View>

                          {/* LOGIKA PENAMAAN GANDA / SINGLE */}
                          <Text style={styles.tableCellPeserta}>
                            {matchData.match?.doubleTeam1?.namaTim || matchData.match?.peserta1?.namaLengkap || 'TBA'}
                          </Text>

                          <Text style={styles.textVs}>vs</Text>

                          <Text style={styles.tableCellPeserta}>
                            {matchData.match?.doubleTeam2?.namaTim || matchData.match?.peserta2?.namaLengkap || 'TBA'}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{ color: '#ddd', fontSize: 12 }}>-</Text>
                      )}
                    </View>
                  );
                })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default JadwalPDF;