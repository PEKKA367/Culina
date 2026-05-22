export class JwtProxy {
    constructor(client) {
        this.client = client;
    }

    async request(url, config = {}) {
        //Ensure the headers object exists so we don't get an error
        if (!config.headers) {
            config.headers = {};
        }

        //Inject the fake JWT token before sending the request
        let token = "dummy-jwt-token-123";
        config.headers["Authorization"] = "Bearer " + token;

        //Delegate the actual network request to the base client
        let response = await this.client.request(url, config);

        //Automatic token renewal on 401 error
        if (response.status === 401) {
            console.warn("[JwtProxy] Token expired (401). Attempting to refresh...");

            let newToken = "refreshed-jwt-token-999";
            config.headers["Authorization"] = "Bearer " + newToken;

            console.log("[JwtProxy] Token refreshed. Retrying request.");

            response = await this.client.request(url, config);
        }

        return response;
    }
}

export class ApiKeyProxy {
    constructor(client) {
        this.client = client;
    }

    async request(url, config = {}) {
        if (!config.headers) {
            config.headers = {};
        }

        config.headers["X-API-Key"] = "secret-api-key-777";

        return await this.client.request(url, config);
    }
}

export class OAuthProxy {
    constructor(client) {
        this.client = client;
    }

    async request(url, config = {}) {
        if (!config.headers) {
            config.headers = {};
        }

        config.headers["Authorization"] = "OAuth some-oauth-string";

        return await this.client.request(url, config);
    }
}