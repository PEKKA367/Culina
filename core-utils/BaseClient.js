export class BaseClient {
    async request(url, config = {}) {
        try {
            const response = await fetch(url, config);
            return response;
        } catch (error) {
            console.error("[BaseClient] Network request failed:", error);
            throw error;
        }
    }
}