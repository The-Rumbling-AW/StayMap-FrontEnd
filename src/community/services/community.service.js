import httpInstance from "../../shared/services/http.instance.js";

/**
 * @class CategoryService
 * @description Service class for handling CRUD operations on categories using HTTP requests
 */
export class CommunityService {
    /** @type {string} The API endpoint for categories */
    resourceEndpoint = import.meta.env.VITE_COMMUNITIES_ENDPOINT_PATH;

    /**
     * Retrieves all categories
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to an array of categories
     */
    getAll() {
        return httpInstance.get(this.resourceEndpoint);
    }

    /**
     * Retrieves a category by its ID
     * @param {number|string} id - The ID of the category to retrieve
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to the category object
     */
    getById(id) {
        return httpInstance.get(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Creates a new category
     * @param {Object} resource - The category object to create
     * @param {string} resource.name - The name of the category
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to the created category
     */
    create(resource) {
        return httpInstance.post(this.resourceEndpoint, resource);
    }

    join(communityId, userId) {
        return httpInstance.post(`${this.resourceEndpoint}/${communityId}/join?userId=${userId}`);
    }

    leave(communityId, userId) {
        return httpInstance.delete(`${this.resourceEndpoint}/${communityId}/join?userId=${userId}`);
    }
    /**
     * Updates an existing category
     * @param {number|string} id - The ID of the category to update
     * @param {Object} resource - The updated category data
     * @param {string} resource.name - The updated name of the category
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to the updated category
     */
    update(id, resource) {
        return httpInstance.put(`${this.resourceEndpoint}/${id}`, resource);
    }

    /**
     * Deletes a category by its ID
     * @param {number|string} id - The ID of the category to delete
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves when the category is deleted
     */
    delete(id) {
        return httpInstance.delete(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Retrieves categories by name
     * @param {string} name - The name to search for
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to an array of matching categories
     */
    getByName(name) {
        return httpInstance.get(`${this.resourceEndpoint}?name=${name}`);
    }


}