const SHEET_ID_PROPERTY = "SIKKER_ORDERS_SPREADSHEET_ID";
const ORDER_CACHE_SECONDS = 21600;
const MAX_POST_BYTES = 30000;

function setupOrdersSheet() {
	const properties = PropertiesService.getScriptProperties();
	const existingId = properties.getProperty(SHEET_ID_PROPERTY);

	if (existingId) {
		const existing = SpreadsheetApp.openById(existingId);
		return existing.getUrl();
	}

	const spreadsheet = SpreadsheetApp.create("SIKKER Customer Orders");
	const sheet = spreadsheet.getSheets()[0];
	sheet.setName("Orders");
	sheet.appendRow([
		"Order Number",
		"Order Date",
		"Status",
		"Customer Name",
		"WhatsApp",
		"Email",
		"Address",
		"Area",
		"District",
		"Delivery Note",
		"Items",
		"Subtotal (BDT)",
		"Discount (BDT)",
		"Delivery (BDT)",
		"Total (BDT)",
		"Payment Method",
		"Payment Status",
		"Transaction ID"
	]);
	sheet.setFrozenRows(1);
	sheet.getRange(1, 1, 1, 18).setFontWeight("bold");
	properties.setProperty(SHEET_ID_PROPERTY, spreadsheet.getId());

	return spreadsheet.getUrl();
}

function doGet() {
	return textResponse("SIKKER order sheet endpoint is ready.");
}

function doPost(event) {
	const lock = LockService.getScriptLock();

	if (!lock.tryLock(5000)) {
		return textResponse("busy");
	}

	try {
		const rawBody = event && event.postData && event.postData.contents;
		const spreadsheetId = PropertiesService
			.getScriptProperties()
			.getProperty(SHEET_ID_PROPERTY);

		if (!spreadsheetId) return textResponse("setup_required");
		if (!rawBody || rawBody.length > MAX_POST_BYTES) return textResponse("invalid");

		const payload = JSON.parse(rawBody);
		const order = payload && payload.order;

		if (!isValidOrder(order)) return textResponse("invalid");

		const cache = CacheService.getScriptCache();
		const orderKey = "order_" + order.orderNumber + "_" + order.date;
		if (cache.get(orderKey)) return textResponse("duplicate");

		const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
		const sheet = spreadsheet.getSheetByName("Orders");
		if (!sheet) return textResponse("sheet_missing");

		const customer = order.customer;
		const payment = order.payment;
		const itemSummary = order.items.map(function (item) {
			return safeCell(item.name, 160) + " x " + Number(item.quantity);
		}).join("; ");

		sheet.appendRow([
			safeCell(order.orderNumber, 40),
			safeCell(order.date, 80),
			safeCell(order.status, 60),
			safeCell(customer.name, 120),
			safeCell(customer.phone, 40),
			safeCell(customer.email, 160),
			safeCell(customer.address, 500),
			safeCell(customer.area, 120),
			safeCell(customer.district, 120),
			safeCell(customer.note, 500),
			safeCell(itemSummary, 8000),
			order.subtotal,
			order.discount,
			order.delivery,
			order.total,
			safeCell(payment.method, 40),
			safeCell(payment.status, 80),
			safeCell(payment.transactionId, 120)
		]);

		cache.put(orderKey, "saved", ORDER_CACHE_SECONDS);
		return textResponse("saved");
	} catch (error) {
		console.error("Order sheet submission failed: " + error.message);
		return textResponse("error");
	} finally {
		lock.releaseLock();
	}
}

function isValidOrder(order) {
	if (!order || typeof order !== "object") return false;
	if (!/^SIKKER-\d{5}$/.test(String(order.orderNumber || ""))) return false;
	if (!order.date || !Number.isFinite(Date.parse(order.date))) return false;
	if (!Array.isArray(order.items) || order.items.length < 1 || order.items.length > 50) return false;
	if (!order.customer || typeof order.customer !== "object") return false;
	if (!order.payment || typeof order.payment !== "object") return false;
	if (!safeCell(order.customer.name, 120) || !safeCell(order.customer.phone, 40)) return false;
	if (!safeCell(order.customer.address, 500) || !safeCell(order.payment.method, 40)) return false;

	return order.items.every(function (item) {
		return item &&
			safeCell(item.name, 160) &&
			Number.isInteger(Number(item.quantity)) &&
			Number(item.quantity) > 0 &&
			Number(item.quantity) <= 999 &&
			isValidAmount(item.price);
	}) && [order.subtotal, order.discount, order.delivery, order.total]
		.every(isValidAmount);
}

function isValidAmount(value) {
	return typeof value === "number" &&
		Number.isFinite(value) &&
		value >= 0 &&
		value <= 100000000;
}

function safeCell(value, limit) {
	let text = String(value == null ? "" : value)
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
		.trim()
		.slice(0, limit);

	if (/^[=+\-@]/.test(text)) text = "'" + text;
	return text;
}

function textResponse(message) {
	return ContentService
		.createTextOutput(message)
		.setMimeType(ContentService.MimeType.TEXT);
}
