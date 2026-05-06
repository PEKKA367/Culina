class BasicClient {
    async request(url, config) {
        return await fetch(url, config);
    }
}

module.exports = BasicClient;