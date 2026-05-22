export class RecipeService {
    constructor(httpClient) {
        this.httpClient = httpClient;
        this.baseUrl = "http://localhost:3000/recipes";
    }

    async getAllRecipes() {
        // Use client despite the use of proxy
        const response = await this.httpClient.request(this.baseUrl);
        return await response.json();
    }

    async deleteRecipeById(id) {
        const url = this.baseUrl + "/" + id;
        const config = {
            method: "DELETE"
        };

        const response = await this.httpClient.request(url, config);
        return response;
    }

    async searchRecipes(searchText) {
        const url = this.baseUrl + "/search?searchText=" + searchText;
        const response = await this.httpClient.request(url);

        if (!response.ok) {
            console.error("[RecipeService] Search failed");
            return [];
        }

        return await response.json();
    }
}