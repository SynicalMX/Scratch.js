var mo = function() {
                function e(t, o, n, a) {
                    !function(e, t) {
                        if (!(e instanceof t))
                            throw new TypeError("Cannot call a class as a function")
                    }(this, e),
                    this.vm = o,
                    this.username = n,
                    this.projectId = a,
                    this.cloudHost = t,
                    this.connectionAttempts = 0,
                    this.queuedData = [],
                    this.openConnection(),
                    this.sendCloudData = go()(this._sendCloudData, 100)
                }
                var t, o, n;
                return t = e,
                (o = [{
                    key: "openConnection",
                    value: function() {
                        this.connectionAttempts += 1;
                        try {
                            this.connection = new WebSocket(("http:" === location.protocol ? "ws://" : "wss://") + this.cloudHost)
                        } catch (e) {
                            return Q.a.warn("Websocket support is not available in this browser", e),
                            void (this.connection = null)
                        }
                        this.connection.onerror = this.onError.bind(this),
                        this.connection.onmessage = this.onMessage.bind(this),
                        this.connection.onopen = this.onOpen.bind(this),
                        this.connection.onclose = this.onClose.bind(this)
                    }
                }, {
                    key: "onError",
                    value: function(e) {
                        Q.a.error("Websocket connection error: ".concat(JSON.stringify(e)))
                    }
                }, {
                    key: "onMessage",
                    value: function(e) {
                        var t = this;
                        e.data.split("\n").forEach((function(e) {
                            if (e) {
                                var o = t.parseMessage(JSON.parse(e));
                                t.vm.postIOData("cloud", o)
                            }
                        }
                        ))
                    }
                }, {
                    key: "onOpen",
                    value: function() {
                        var e = this;
                        this.connectionAttempts = 1,
                        this.writeToServer("handshake"),
                        Q.a.info("Successfully connected to clouddata server."),
                        this.queuedData.forEach((function(t) {
                            e.sendCloudData(t)
                        }
                        )),
                        this.queuedData = []
                    }
                }, {
                    key: "onClose",
                    value: function() {
                        Q.a.info("Closed connection to websocket");
                        var e = this.randomizeDuration(this.exponentialTimeout());
                        this.setTimeout(this.openConnection.bind(this), e)
                    }
                }, {
                    key: "exponentialTimeout",
                    value: function() {
                        return 1e3 * (Math.pow(2, Math.min(this.connectionAttempts, 5)) - 1)
                    }
                }, {
                    key: "randomizeDuration",
                    value: function(e) {
                        return Math.random() * e
                    }
                }, {
                    key: "setTimeout",
                    value: function(e, t) {
                        Q.a.info("Reconnecting in ".concat((t / 1e3).toFixed(1), "s, attempt ").concat(this.connectionAttempts)),
                        this._connectionTimeout = window.setTimeout(e, t)
                    }
                }, {
                    key: "parseMessage",
                    value: function(e) {
                        var t = {};
                        switch (e.method) {
                        case "set":
                            t.varUpdate = {
                                name: e.name,
                                value: e.value
                            }
                        }
                        return t
                    }
                }, {
                    key: "writeToServer",
                    value: function(e, t, o, n) {
                        var a = {};
                        a.method = e,
                        a.user = this.username,
                        a.project_id = this.projectId,
                        t && (a.name = t),
                        n && (a.new_name = n),
                        null != o && (a.value = o);
                        var i = JSON.stringify(a);
                        this.connection && this.connection.readyState === WebSocket.OPEN ? this.sendCloudData(i) : "create" !== a.method && "delete" !== a.method && "rename" !== a.method || this.queuedData.push(i)
                    }
                }, {
                    key: "_sendCloudData",
                    value: function(e) {
                        this.connection.send("".concat(e, "\n"))
                    }
                }, {
                    key: "createVariable",
                    value: function(e, t) {
                        this.writeToServer("create", e, t)
                    }
                }, {
                    key: "updateVariable",
                    value: function(e, t) {
                        this.writeToServer("set", e, t)
                    }
                }, {
                    key: "renameVariable",
                    value: function(e, t) {
                        this.writeToServer("rename", e, null, t)
                    }
                }, {
                    key: "deleteVariable",
                    value: function(e) {
                        this.writeToServer("delete", e)
                    }
                }, {
                    key: "requestCloseConnection",
                    value: function() {
                        this.connection && this.connection.readyState !== WebSocket.CLOSING && this.connection.readyState !== WebSocket.CLOSED && (Q.a.info("Request close cloud connection without reconnecting"),
                        this.connection.onclose = function() {}
                        ,
                        this.connection.onerror = function() {}
                        ,
                        this.connection.close()),
                        this.clear()
                    }
                }, {
                    key: "clear",
                    value: function() {
                        this.connection = null,
                        this.vm = null,
                        this.username = null,
                        this.projectId = null,
                        this._connectionTimeout && (clearTimeout(this._connectionTimeout),
                        this._connectionTimeout = null),
                        this.connectionAttempts = 0
                    }
                }]) && po(t.prototype, o),
                n && po(t, n),
                e
            }();