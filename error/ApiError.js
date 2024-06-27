class ApiError extends Error {
	// создаём класс
	constructor(status, message) {
		// реализовываем конструктор, который параметрами принимает Status Code и сообщение которое вернём на клиент
		super() // функция super вызывает родительский конструктор
		this.status = status
		this.message = message // <-- присваиваем то, что получаем параметрами
	}

	static badRequest(message) {
		return new ApiError(404, message)
	}

	static internal(message) {
		return new ApiError(500, message)
	}

	static forbidden(message) {
		return new ApiError(403, message)
	}
}

module.exports = ApiError
