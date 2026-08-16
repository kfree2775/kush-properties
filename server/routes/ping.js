import express from 'express';

const router = express.Router();

// A lightweight route designed specifically for UptimeRobot
// to keep the Render free tier instance awake.
router.get('/', (req, res) => {
  res.status(200).send('OK');
});

export default router;
