import Account from "./Account"

export default class Cloud {
	private account: Account
	public projectID: string | number
	private host = "clouddata.scratch.mit.edu/"
	private connection: WebSocket
	private _connectionTimeout: number
	public connectionAttempts: number
	private queuedData: string[] = []

	constructor(account: Account) {
		this.account = account
		this.openConnection()
	}

	public setVariable(variable: string, value: string | number) {
		value.toString()

		this.writeToServer("set", variable, value)
	}

	private openConnection() {
		while (this.connection.CLOSED) {
			this.connectionAttempts += 1
			try {
				this.connection = new WebSocket(("http:" === location.protocol ? "ws://" : "wss://") + this.host)
			} catch (_e) { }
		}

		this.connection.onerror = this.onError.bind(this),
			this.connection.onopen = this.onOpen.bind(this),
			this.connection.onclose = this.onClose.bind(this)
	}

	private _sendCloudData(data: string) {
		this.connection.send("".concat(data, "\n"))
	}

	private writeToServer(method: string, name?: string, value?: string | number, new_name?: string) {
		const data = new CloudData(method, this.account.username, this.projectID)
		name && (data.name = name),
			new_name && (data.new_name = new_name),
			null != value && (data.value = value);
		const json = data.returnJSON()
		this.connection && this.connection.readyState === WebSocket.OPEN ? this._sendCloudData(json) : "create" !== data.method && "delete" !== data.method && "rename" !== data.method || this.queuedData.push(json)
	}

	private onError(error: Error) {
		throw error
	}

	private onOpen() {
		this.connectionAttempts = 1,
		this.writeToServer("handshake"),
		this.queuedData.forEach((t) => {
			this._sendCloudData(t)
		})
		this.queuedData = []
	}

	private onClose() {
		var e = this.randomizeDuration(this.exponentialTimeout());
		this.setTimeout(this.openConnection.bind(this), e)
	}

	private randomizeDuration(e) {
		return Math.random() * e
	}

	private setTimeout(call, time) {
		console.log("Reconnecting in ".concat((time / 1e3).toFixed(1), "s, attempt ").concat(this.connectionAttempts.toString())),
    	this._connectionTimeout = window.setTimeout(call, time)
	}
	
	private exponentialTimeout() {
		return 1e3 * (Math.pow(2, Math.min(this.connectionAttempts, 5)) - 1)
	}
}

class CloudData {
	public method: string
	public user: string
	public project_id: string | number
	public name: string
	public new_name: string
	public value: string | number

	constructor(method: string, user: string, project_id: string | number) {
		this.method = method
		this.user = user
		this.project_id = project_id
	}

	public returnJSON() {
		let result = "{"
		result += `"method": "${this.method}", "user": "${this.user}", "project_id": "${this.project_id.toString()}"`
		result += "}"

		return result
	}
}