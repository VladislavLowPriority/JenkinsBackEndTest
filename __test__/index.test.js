const request = require('supertest')
const { app, start } = require('../index')
const jwt = require('jsonwebtoken')
let server,
	tokenUser,
	tokenAdmin,
	createdTypeId,
	createdBrandId,
	createdDeviceId

const payloadUser = {
	id: 1,
	email: 'test@example.com',
	role: 'USER',
}

const payloadAdmin = {
	id: 2,
	email: 'Admin@example.com',
	role: 'Admin',
}

tokenUser = jwt.sign(payloadUser, process.env.SECRET_KEY, {
	expiresIn: '24h',
})
tokenAdmin = jwt.sign(payloadAdmin, process.env.SECRET_KEY, {
	expiresIn: '24h',
})

describe('Server Tests', () => {
	beforeAll(async () => {
		let server,
			tokenUser,
			tokenAdmin,
			createdTypeId,
			createdBrandId,
			createdDeviceId
		server = await start()
		tokenUser = jwt.sign(payloadUser, process.env.SECRET_KEY, {
			expiresIn: '24h',
		})
		tokenAdmin = jwt.sign(payloadAdmin, process.env.SECRET_KEY, {
			expiresIn: '24h',
		})
	})

	it('Статус 200 на GET запрос по /api/user/auth и проверка данных пользователя', async () => {
		const response = await request(app)
			.get('/api/user/auth')
			.set('Authorization', `Bearer ${tokenUser}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toHaveProperty('id', payloadUser.id)
		expect(response.body).toHaveProperty('email', payloadUser.email)
		expect(response.body).toHaveProperty('role', payloadUser.role)
	})

	it('Статус 200 на GET запрос по /api/user/auth и проверка данных администратора', async () => {
		const response = await request(app)
			.get('/api/user/auth')
			.set('Authorization', `Bearer ${tokenAdmin}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toHaveProperty('id', payloadAdmin.id)
		expect(response.body).toHaveProperty('email', payloadAdmin.email)
		expect(response.body).toHaveProperty('role', payloadAdmin.role)
	})

	it('Статус 200 на GET запрос по /api/device', async () => {
		const response = await request(app).get('/api/device')
		expect(response.statusCode).toBe(200)
	})

	it('Статус 200 на GET запрос по /api/brand', async () => {
		const response = await request(app).get('/api/brand')
		expect(response.statusCode).toBe(200)
	})

	it('Статус 200 на GET запрос по /api/basket/1 с валидным токеном', async () => {
		const response = await request(app)
			.get('/api/basket/1')
			.set('Authorization', `Bearer ${tokenUser}`)
		expect(response.statusCode).toBe(200)
	})

	it('Статус 200 на POST запрос по /api/type проверка возможностей администратора на создание/удаление нового типа товара', async () => {
		const newType = {
			name: 'Новый тип товара',
		}

		const typeResponse = await request(app)
			.post('/api/type')
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.send(newType)

		expect(typeResponse.statusCode).toBe(200)
		expect(typeResponse.body).toHaveProperty('id')
		expect(typeResponse.body).toHaveProperty('name', newType.name)
		const createdTypeId = typeResponse.body.id
		if (createdTypeId) {
			const deleteTypeResponse = await request(app)
				.delete(`/api/type/${createdTypeId}`)
				.set('Authorization', `Bearer ${tokenAdmin}`)
			expect(deleteTypeResponse.statusCode).toBe(200)
		}
	})

	it('Статус 200 на POST запрос по /api/brand проверка возможностей администратора на создание/удаление нового бренда', async () => {
		const newBrand = {
			name: 'Новый бренд товара',
		}

		const brandResponse = await request(app)
			.post('/api/brand')
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.send(newBrand)

		expect(brandResponse.statusCode).toBe(200)
		expect(brandResponse.body).toHaveProperty('id')
		expect(brandResponse.body).toHaveProperty('name', newBrand.name)
		const createdBrandId = brandResponse.body.id
		if (createdBrandId) {
			const deleteTypeResponse = await request(app)
				.delete(`/api/brand/${createdBrandId}`)
				.set('Authorization', `Bearer ${tokenAdmin}`)
			expect(deleteTypeResponse.statusCode).toBe(200)
		}
	})
	const path = require('path') // Импортируем path для указания пути к тестовому изображению

	it('Статус 200 на POST запрос по /api/device проверка возможностей администратора на создание/удаление нового товара', async () => {
		const newType = {
			name: 'Новый тип товара9',
		}

		const typeResponse = await request(app)
			.post('/api/type')
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.send(newType)

		expect(typeResponse.statusCode).toBe(200)
		expect(typeResponse.body).toHaveProperty('id')
		expect(typeResponse.body).toHaveProperty('name', newType.name)
		const createdTypeId = typeResponse.body.id

		const newBrand = {
			name: 'Новый бренд товара9',
		}

		const brandResponse = await request(app)
			.post('/api/brand')
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.send(newBrand)

		expect(brandResponse.statusCode).toBe(200)
		expect(brandResponse.body).toHaveProperty('id')
		expect(brandResponse.body).toHaveProperty('name', newBrand.name)
		const createdBrandId = brandResponse.body.id

		const newDevice = {
			name: 'Новый товар9',
			price: 1000,
			typeId: createdTypeId,
			brandId: createdBrandId,
		}

		const response = await request(app)
			.post('/api/device')
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.field('name', newDevice.name) // Добавляем поле, чтобы отправить JSON данные
			.field('price', newDevice.price)
			.field('typeId', newDevice.typeId)
			.field('brandId', newDevice.brandId)
			.attach(
				'img',
				path.resolve(
					__dirname,
					'../static/538965f9-6131-4bda-bd95-c03a84fcd619.jpg'
				)
			) // Указываем путь к тестовому изображению

		expect(response.statusCode).toBe(200)
		expect(response.body).toHaveProperty('id')
		expect(response.body).toHaveProperty('name', newDevice.name)
		expect(response.body).toHaveProperty('price', newDevice.price)
		expect(response.body).toHaveProperty('img')
		const createdDeviceId = response.body.id

		if (createdTypeId) {
			const deleteTypeResponse = await request(app)
				.delete(`/api/type/${createdTypeId}`)
				.set('Authorization', `Bearer ${tokenAdmin}`)
			expect(deleteTypeResponse.statusCode).toBe(200)
		}

		if (createdBrandId) {
			const deleteBrandResponse = await request(app)
				.delete(`/api/brand/${createdBrandId}`)
				.set('Authorization', `Bearer ${tokenAdmin}`)
			expect(deleteBrandResponse.statusCode).toBe(200)
		}

		if (createdDeviceId) {
			const deleteDeviceResponse = await request(app)
				.delete(`/api/device/${createdDeviceId}`)
				.set('Authorization', `Bearer ${tokenAdmin}`)
			expect(deleteDeviceResponse.statusCode).toBe(200)
		}
	}, 20000)
})
