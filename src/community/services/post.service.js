import httpInstance from "@/shared/services/http.instance.js";

/**
 * @class PostService
 * @description Service class for handling CRUD operations on posts
 */
export class PostService {
    /** @type {string} The API endpoint for posts */
    resourceEndpoint = import.meta.env.VITE_POSTS_ENDPOINT_PATH;

    /**
     * Retrieves all posts (if needed)
     */
    getAll() {
        return httpInstance.get(this.resourceEndpoint);
    }

    /**
     * Retrieves a post by its ID
     * @param {number|string} id - The ID of the post
     */
    getById(id) {
        return httpInstance.get(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Creates a new post in a community
     * @param {number|string} communityId - ID of the community
     * @param {number|string} userId - ID of the user
     * @param {{ content: string, imageUrl: string }} postData - Post body
     */
    create(communityId, userId, postData) {
        return httpInstance.post(
            `${this.resourceEndpoint}/communities/${communityId}/posts?userId=${userId}`,
            postData
        );
    }

    /**
     * Updates an existing post
     * @param {number|string} id - Post ID
     * @param {object} updatedData - Post content to update
     */
    update(id, updatedData) {
        return httpInstance.put(`${this.resourceEndpoint}/${id}`, updatedData);
    }

    /**
     * Deletes a post
     * @param {number|string} id - ID of the post
     */
    delete(id) {
        return httpInstance.delete(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Gets all posts by a community ID
     * @param {number|string} communityId
     */
    getByCommunityId(communityId) {
        return httpInstance.get(`${this.resourceEndpoint}/by-community/${communityId}`);
    }
}