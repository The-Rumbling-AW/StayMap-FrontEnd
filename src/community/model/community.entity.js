export class Community {
    constructor({ id = '', name = '', image = '', tags = [], members = [], posts = [], description = ""}) {
        this.id = id;
        this.name = name;
       // this.memberQuantity = memberQuantity;
        this.image = image;
        this.tags = tags;
        this.members = members;
        this.posts = posts;
        this.description = description;
    }
}
