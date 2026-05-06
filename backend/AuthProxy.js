class AuthProxy {
    constructor(client) {
        this.client = client;
    }

    async request(url, config = {}) {
        config.headers = { "Authorization": "Bearer 12345" };
        return await this.client.request(url, config);
    }
}

module.exports = AuthProxy;