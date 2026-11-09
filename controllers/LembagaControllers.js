const Lembaga = require('../models/LembagaModel');

exports.create = async (req, res) => {
  try {
    const Lembaga = await Lembaga.create(req.body);
    res.status(201).json(Lembaga);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Lembaga.find());
};