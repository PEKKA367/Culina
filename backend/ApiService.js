class ApiService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    async getUserData() {
        return await this.httpClient.request("https://jsonplaceholder.typicode.com/users/1");
    }
}

module.exports = ApiService;