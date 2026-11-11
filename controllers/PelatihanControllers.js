const Pelatihan = require('../models/PelatihanModel'); //model utama
const Lembaga = require('../models/LembagaModel'); // model pendukung 
const { errorHttp } = require('../middlewares/errorHandler');

const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;
const FIELD_SORT = ['nama', 'nim', 'createdAt']; 
const FIELD_BOLEH_DIPILIH = ['kodePelatihan', 'judul', 'kuota', 'bidang', 'jadwal', 'lembagaId', 'createdAt'];

// Mengubah bilangan dari query string menjadi bilangan bulat yang aman
function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

exports.create = async (req, res) => {
  try {
    const pelatihan = await Pelatihan.create(req.body);
    res.status(201).json(pelatihan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const filter = {};
  if(req.query.selesai){
    filter['jadwal.selesai'] = String(req.query.selesai);
  }
  if (req.query.lembaga) {
    const lembaga = await Lembaga.findOne({ kode: String(req.query.lembaga).toUpperCase() });
    // Kode prodi tidak dikenal -> hasil kosong ($in: [] tidak cocok dengan apa pun)
    filter.koleksiId = koleksi ? koleksi._id : { $in: [] };
  }

  const page = angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = angkaAman(req.query.limit, LIMIT_DEFAULT, 1, LIMIT_MAKS);

  // Sorting: ?sort=nama (naik) atau ?sort=-nama (turun). Bawaan: terbaru dulu
  const sortParam = String(req.query.sort || '-createdAt');
  const arah = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');
  if (!FIELD_SORT.includes(sortField)) {
    throw errorHttp(400, `sort hanya boleh: ${FIELD_SORT.join(', ')}`);
  }

  // Projection: ?fields=nama,nim
  let select = '';
  if (req.query.fields) {
    const fields = String(req.query.fields).split(',').map((f) => f.trim());
    if (!fields.every((f) => FIELD_BOLEH_DIPILIH.includes(f))) {
      throw errorHttp(400, `fields hanya boleh: ${FIELD_BOLEH_DIPILIH.join(', ')}`);
    }
    select = fields.join(' ');
  }

  const query = Pelatihan.find(filter)
    .select(select)
    .sort({ [sortField]: arah, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // populate() otomatis menambahkan prodiId ke hasil, jadi hanya dipanggil
  // bila prodiId memang diminta (atau bila tidak ada pemilihan field)
  if (!select || select.split(' ').includes('lembagaId')) {
    query.populate('lembagaId', 'kode nama');
  }

  const [data, total] = await Promise.all([query, Pelatihan.countDocuments(filter)]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
};

exports.getById = async (req, res) => {
  const data = await Pelatihan.findById(req.params.id).populate('lembagaId');
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.update = async (req, res) => {
  const data = await Pelatihan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: 'after', runValidators: true }
  );
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await Pelatihan.findByIdAndDelete(req.params.id);
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.status(204).send();
};