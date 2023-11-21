import express from 'express';

const router = express.Router();

router.get('/greet', (req, res) => {
  res.json({ message: 'Greetings!' });
});

export default router;
