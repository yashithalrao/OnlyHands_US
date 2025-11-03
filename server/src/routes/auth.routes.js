
// import { Router } from 'express';
// import { login, me, logout } from '../controllers/auth.controller.js';
// import { requireAuth } from '../middleware/auth.js';
// import User from '../models/User.js';

// const router = Router();

// // --- Auth core ---
// router.post('/login', login);
// router.get('/me', requireAuth, me);
// router.post('/logout', logout);

// // --- DEV ONLY: seed users ---
// router.post('/seed', async (_req, res) => {
//   try {
//     await User.deleteMany({});
//     const users = await User.insertMany([
//       { name: 'Mona Manager', email: 'manager@demo.com', password: 'pass123', role: 'manager' },
//       { name: 'Vivek Volunteer', email: 'vol@demo.com', password: 'pass123', role: 'volunteer' },
//     ]);
//     res.json({ users: users.map(u => ({ email: u.email, role: u.role })) });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: 'Seed failed' });
//   }
// });

// export default router;
import { Router } from 'express';
import { login, me, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

// DEV ONLY: seed users via GET or POST
async function doSeed(_req, res) {
  try {
    await User.deleteMany({});
    const users = await User.create([
      { name: 'Mona Manager',    email: 'manager@demo.com',   password: 'pass123', role: 'manager' },
      { name: 'Rohan Manager',   email: 'manager2@demo.com',  password: 'pass123', role: 'manager' },
      { name: 'Vivek Volunteer', email: 'vol@demo.com',       password: 'pass123', role: 'volunteer' },
      { name: 'Sara Volunteer',  email: 'vol2@demo.com',      password: 'pass123', role: 'volunteer' }
    ]);
    res.json({ users: users.map(u => ({ email: u.email, role: u.role })) });
  } catch (e) {
    console.error('[SEED ERROR]', e);
    res.status(500).json({ message: 'Seed failed' });
  }
}
router.get('/seed', doSeed);
router.post('/seed', doSeed);





export default router;
