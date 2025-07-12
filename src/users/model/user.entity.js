/**
 * @class User
 * @description Entity class representing a user in the system
 */
export class User {
    constructor({
                    id,
                    name,
                    email,
                    password,
                    profileImage,
                    type,
                    location,
                    upcomingConcerts = [],
                    attendedConcerts = [],
                    communitiesJoined = [],
                    postsDone = []
                }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
        this.type = type; // 'fan' o 'artist'
        this.location = location; // { lat: number, lng: number }
        this.upcomingConcerts = upcomingConcerts; // [1, 2, 3, ...]
        this.attendedConcerts = attendedConcerts; // [4, 5, 6, ...]
        this.communitiesJoined = communitiesJoined;
        this.postsDone = postsDone;
    }
}
