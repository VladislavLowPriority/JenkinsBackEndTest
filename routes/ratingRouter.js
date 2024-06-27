const Router = require('express').Router
const ratingController = require('../controllers/ratingController')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()

router.post(
	'/put/:userId/:deviceId',
	authMiddleware,
	ratingController.putRating
)
router.get('/', authMiddleware, ratingController.getRating)

module.exports = router
