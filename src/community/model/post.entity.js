export class Post {
    constructor({id = 0, userId = 0, communityId = 0, content = "", postedAt = "", imageUrl = ""}) {
        this.id=id;
        this.userId = userId;
        this.communityId = communityId;
        this.content = content;
        this.postedAt = postedAt;
        this.imageUrl = imageUrl;
    }
}