const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Tambahkan ini
const { User } = require('../models');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ success: false, message: 'Email tidak ditemukan' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ success: false, message: 'Password salah' });

  // Buat token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );

  return res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});


module.exports = router;