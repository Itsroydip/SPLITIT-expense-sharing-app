import express from 'express'
import multer from 'multer'
import { scanReceipt } from '../controllers/receipt.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'))
    }
    cb(null, true)
  }
})

const router = express.Router()
router.use(authMiddleware)
router.post('/scan', upload.single('receipt'), scanReceipt)

export default router