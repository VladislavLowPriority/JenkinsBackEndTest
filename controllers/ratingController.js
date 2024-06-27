const { Rating, User, Device } = require('../models/models')
const ApiError = require('../error/ApiError')

class RatingController {
	async putRating(req, res, next) {
		try {
			const { userId, deviceId } = req.params
			const { rate } = req.body
			const currentUser = req.user.id

			// Проверка, что пользователь является авторизованным и соответствует userId из маршрута
			if (currentUser !== parseInt(userId)) {
				return next(ApiError.forbidden('Access denied'))
			}

			// Проверка, что устройство существует
			const device = await Device.findByPk(deviceId)
			if (!device) {
				return next(ApiError.notFound('Device not found'))
			}

			// Проверка, что пользователь купил товар (логика проверки покупки не реализована)
			const userBoughtDevice = true // Пример логики. Здесь надо добавить логику для проверки покупки товара, пока что просто true

			if (!userBoughtDevice) {
				return next(
					ApiError.forbidden('Товар не куплен, поставить оценку нельзя')
				)
			}
			let rating = await Rating.findOne({
				where: {
					userId: userId,
					deviceId: deviceId,
				},
			})

			if (rate < 0 || rate > 5) {
				return next(
					ApiError.badRequest(
						'Оценка товара не может быть больше 5 и меньше чем 0'
					)
				)
			}
			if (rating) {
				// Если оценка существует, обновляем её
				rating.rate = rate
				await rating.save()
			} else {
				// Если оценка не существует, создаём новую
				rating = await Rating.create({ rate, userId, deviceId })
			}

			const ratings = await Rating.findAll({ where: { deviceId } })
			const totalRating = ratings.reduce((acc, rate) => acc + rate.rate, 0)
			const averageRating = totalRating / ratings.length

			console.log(
				`Total rating: ${totalRating}, Number of ratings: ${ratings.length}, Average rating: ${averageRating}`
			)

			// Обновляем рейтинг устройства
			device.rating = averageRating
			await device.save()

			return res.json(rating)
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}

	async getRating(req, res, next) {
		try {
			const ratings = await Rating.findAll({
				include: [{ model: User }, { model: Device }],
			})
			return res.json(ratings)
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}
}

module.exports = new RatingController()
