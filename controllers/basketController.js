const { Basket, BasketDevice, Device } = require('../models/models')
const ApiError = require('../error/ApiError')

class basketController {
	constructor() {
		this.addDevice = this.addDevice.bind(this)
		this.removeDevice = this.removeDevice.bind(this)
		this.getBasket = this.getBasket.bind(this)
		this.clearBasket = this.clearBasket.bind(this)
		this.checkBasketOwnership = this.checkBasketOwnership.bind(this)
	}
	// -  Проверка на соответствие пользователя и корзины -
	async checkBasketOwnership(userId, basketId, next) {
		const basket = await Basket.findByPk(basketId)
		if (!basket || basket.userId !== userId) {
			throw ApiError.forbidden('Access denied')
		}
		return basket
	}
	// - - - Добавление товара - - - - -
	async addDevice(req, res, next) {
		try {
			const { basketId, deviceId, quantity } = req.body
			const userId = req.user.id
			await this.checkBasketOwnership(userId, basketId, next)
			let basket = await Basket.findByPk(basketId)
			if (!basket) {
				return next(ApiError.badRequest('Корзина не найдена'))
			}
			let device = await Device.findByPk(deviceId)
			if (!device) {
				return next(ApiError.badRequest('Device not found'))
			}
			// Найти товар в корзине
			let basketDevice = await BasketDevice.findOne({
				where: { basketId, deviceId },
			})

			if (basketDevice) {
				// Если товар уже есть в корзине, увеличиваем его количество
				basketDevice.quantity += quantity || 1
				await basketDevice.save()
			} else {
				// Если товара нет в корзине, добавляем его с указанным количеством
				basketDevice = await BasketDevice.create({
					basketId,
					deviceId,
					quantity: quantity || 1,
				})
			}

			return res.json(basketDevice)
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}

	// - - - Удаление товара - - - - -
	async removeDevice(req, res, next) {
		try {
			const { basketId, deviceId } = req.params // Идентификатор basketDevice
			const userId = req.user.id
			await this.checkBasketOwnership(userId, basketId, next)
			const basketDevice = await BasketDevice.findOne({
				where: { basketId, deviceId },
			}) // Находим basketDevice по id
			if (!basketDevice) {
				return next(ApiError.notFound('Basket device not found'))
			}

			// Уменьшаем количество товара
			basketDevice.quantity -= 1

			// Если количество товара становится меньше 1, удаляем товар из корзины
			if (basketDevice.quantity < 1) {
				await basketDevice.destroy()
			} else {
				await basketDevice.save()
			}

			return res.json({
				message: 'Количество товара уменьшено или товар удален из корзины',
			})
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}
	// - - - Получение корзины - - - -
	async getBasket(req, res, next) {
		try {
			const { basketId } = req.params
			const userId = req.user.id
			await this.checkBasketOwnership(userId, basketId, next)
			const basket = await Basket.findByPk(basketId)

			if (!basket) {
				return next(ApiError.badRequest('Basket not found'))
			}

			const basketDevices = await BasketDevice.findAll({
				where: { basketId },
				include: { model: Device },
			})

			return res.json(basketDevices)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	// - - - Очищение корзины - - - - -
	async clearBasket(req, res, next) {
		try {
			const { basketId } = req.params
			const userId = req.user.id
			await this.checkBasketOwnership(userId, basketId, next)
			await BasketDevice.destroy({ where: { basketId } })

			return res.json({ message: 'Корзина очищена' })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
}

module.exports = new basketController()
