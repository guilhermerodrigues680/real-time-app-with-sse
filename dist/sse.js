"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEClient = void 0;
const events_1 = require("events");
var SSEEvents;
(function (SSEEvents) {
    SSEEvents["PING"] = "ping";
})(SSEEvents || (SSEEvents = {}));
var SSEClientEvents;
(function (SSEClientEvents) {
    SSEClientEvents["CLOSE"] = "close";
})(SSEClientEvents || (SSEClientEvents = {}));
class SSEClient extends events_1.EventEmitter {
    constructor(req, wStream) {
        super();
        this.keepAliveCount = 0;
        this.req = req;
        this.wStream = wStream;
        this.isConnOpen = true;
        this.keepAliveTimeoutID = null;
        this.clientInfo = {
            userAgent: this.parseReqHeader(req.headers["user-agent"]),
            xForwardedFor: this.parseReqHeader(req.headers["x-forwarded-for"]),
            remoteAddress: req.socket.remoteAddress || "",
            remotePort: req.socket.remotePort || 0,
        };
        this.keepAlive();
        this.req.once("close", () => {
            this.isConnOpen = false;
            this.keepAliveTimeoutID !== null &&
                clearInterval(this.keepAliveTimeoutID);
            this.emit(SSEClientEvents.CLOSE);
        });
    }
    // TODO
    // setRetry(){}
    // TODO
    // keep-alive
    parseReqHeader(headerVal) {
        switch (typeof headerVal) {
            case "undefined":
                return "";
            case "string":
                return headerVal;
            default:
                return headerVal.join(", ");
        }
    }
    keepAlive() {
        if (!this.isConnOpen) {
            console.debug("conexão encerrada. Para keep-alive.");
            return;
        }
        const { keepAliveCount } = this;
        this.sendComment(keepAliveCount);
        this.keepAliveCount++;
        this.keepAliveTimeoutID = setTimeout(() => this.keepAlive(), 2500);
    }
    sendComment(comment) {
        if (!this.isConnOpen) {
            console.warn("conexão encerrada");
            return;
        }
        this.wStream.write(`: ${comment}\n\n`);
    }
    sendMessage(evtData, id) {
        if (!this.isConnOpen) {
            console.warn("conexão encerrada");
            return;
        }
        id !== undefined && this.wStream.write(`id: ${id}\n`);
        this.wStream.write(`data: ${evtData}\n\n`);
    }
    sendTypedEvent(evtName, evtData, id) {
        if (!this.isConnOpen) {
            console.warn("conexão encerrada");
            return;
        }
        id !== undefined && this.wStream.write(`id: ${id}\n`);
        this.wStream.write(`event: ${evtName}\n`);
        this.wStream.write(`data: ${evtData}\n\n`);
    }
}
exports.SSEClient = SSEClient;
