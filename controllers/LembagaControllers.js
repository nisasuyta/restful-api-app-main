const Lembaga = require('../models/LembagaModel');

exports.create = async (req, res) => {
  try {
    const lembaga = await Lembaga.create(req.body);
    res.status(201).json(lembaga);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Lembaga.find());
};