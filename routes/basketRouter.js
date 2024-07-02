const Router = require('express').Router
const basketController = require('../controllers/basketController')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()

router.post('/add', authMiddleware, basketController.addDevice)
router.delete(
	'/remove/:basketId/:deviceId',
	authMiddleware,
	basketController.removeDevice
)
router.get('/:basketId', basketController.getBasket)
router.delete('/clear/:basketId', authMiddleware, basketController.clearBasket)

module.exports = router
