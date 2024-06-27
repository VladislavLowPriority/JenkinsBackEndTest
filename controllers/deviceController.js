const { Device, DeviceInfo } = require('../models/models')
const ApiError = require('../error/ApiError')
const path = require('path')
const uuid = require('uuid')
const fs = require('fs')
class DeviceController {
	async create(req, res, next) {
		try {
			const { name, price, brandId, typeId, info } = req.body
			const { img } = req.files
			let fileName = uuid.v4() + '.jpg'
			img.mv(path.resolve(__dirname, '..', 'static', fileName))
			const device = await Device.create({
				name,
				price,
				brandId,
				typeId,
				img: fileName,
			})
			if (info) {
				let infoParsed
				try {
					infoParsed = JSON.parse(info)
				} catch (e) {
					return next(ApiError.badRequest('Invalid info format'))
				}

				for (const i of infoParsed) {
					await DeviceInfo.create({
						title: i.title,
						description: i.description,
						deviceId: device.id,
					})
				}
			}

			return res.json(device)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	async getAll(req, res, next) {
		try {
			const { brandId, typeId } = req.query
			let { page, limit } = req.query
			page = page || 1
			limit = limit || 9
			let offset = page * limit - limit
			let devices
			if (!brandId && !typeId) {
				devices = await Device.findAndCountAll({ limit, offset }) // Тут использую findAndCountAll с целью получения количества товаров для front'а
			}
			if (brandId && !typeId) {
				devices = await Device.findAndCountAll({
					where: { brandId },
					limit,
					offset,
				})
			}
			if (!brandId && typeId) {
				devices = await Device.findAndCountAll({
					where: { typeId },
					limit,
					offset,
				})
			}
			if (brandId && typeId) {
				devices = await Device.findAndCountAll({
					where: { brandId, typeId },
					limit,
					offset,
				})
			}
			return res.json(devices)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	async getOne(req, res) {
		const { id } = req.params
		const device = await Device.findOne({
			where: { id },
			include: [{ model: DeviceInfo, as: 'info' }],
		})
		return res.json(device)
	}

	async delete(req, res, next) {
		try {
			const { id } = req.params
			const device = await Device.findByPk(id)
			if (!device) {
				return next(ApiError.notFound('Type not found'))
			}
			const fileName = device.img
			const filePath = path.resolve(__dirname, '..', 'static', fileName) // перед тем как удалить товар, найдем его изображение
			await device.destroy()

			fs.unlink(filePath, err => {
				if (err) {
					console.error(err)
				}
			}) // <-- удаляем изображение товара

			return res.json({ message: 'deleted' })
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}
}

module.exports = new DeviceController()
