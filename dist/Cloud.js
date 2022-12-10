export default class Cloud {
    account;
    projectID;
    host = "clouddata.scratch.mit.edu/";
    connection;
    connectionAttempts;
    queuedData = [];
    constructor(account) {
        this.account = account;
        this.openConnection();
    }
    openConnection() {
        while (this.connection.CLOSED) {
            this.connectionAttempts += 1;
            try {
                this.connection = new WebSocket(("http:" === location.protocol ? "ws://" : "wss://") + this.host);
            }
            catch (_e) { }
        }
        this.connection.onerror = this.onError.bind(this),
            this.connection.onmessage = this.onMessage.bind(this),
            this.connection.onopen = this.onOpen.bind(this),
            this.connection.onclose = this.onClose.bind(this);
    }
    sendCloudData(data) {
        this.connection.send("".concat(data, "\n"));
    }
    writeToServer(method, name, value, new_name) {
        const data = new CloudData(method, this.account.username, this.projectID);
        name && (data.name = name),
            new_name && (data.new_name = new_name),
            null != value && (data.value = value);
        const json = data.returnJSON();
        this.connection && this.connection.readyState === WebSocket.OPEN ? this.sendCloudData(json) : "create" !== data.method && "delete" !== data.method && "rename" !== data.method || this.queuedData.push(json);
    }
    onError(error) {
        throw error;
    }
    onOpen() {
        this.connectionAttempts = 1,
            this.writeToServer("handshake"),
            this.queuedData.forEach((t) => {
                this.sendCloudData(t);
            });
        this.queuedData = [];
    }
    onClose() {
        var e = this.randomizeDuration(this.exponentialTimeout());
        this.setTimeout(this.openConnection.bind(this), e);
    }
}
class CloudData {
    method;
    user;
    project_id;
    name;
    new_name;
    value;
    constructor(method, user, project_id) {
        this.method = method;
        this.user = user;
        this.project_id = project_id;
    }
    returnJSON() {
        let result = "{";
        result += `"method": "${this.method}", "user": "${this.user}", "project_id": "${this.project_id.toString()}"`;
        result += "}";
        return result;
    }
}
