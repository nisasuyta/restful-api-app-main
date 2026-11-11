const mongoose = require('mongoose');

const jadwalSchema = new mongoose.Schema({
  mulai: { type: String },
  selesai: { type: String },
}, { _id: false });

const PelatihanSchema = new mongoose.Schema({
  kodePelatihan: { type: String, required: [true, 'kode pelatihan wajib diisi'], unique: true, trim: true },
  judul: { type: String, required: [true, 'judul wajib diisi'], trim: true },
  kuota: { type: Number, required: [true, 'kuota wajib diisi'], min: 1 },
  bidang: { type: String, required: [true, 'bidang wajib diisi'], trim: true },
  jadwal: jadwalSchema,
  lembagaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lembaga', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pelatihan', PelatihanSchema);
