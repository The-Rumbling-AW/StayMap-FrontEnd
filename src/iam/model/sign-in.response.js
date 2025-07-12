export class SignInResponse {
    /**
     * Constructor
     * @param {string} id The id of the user.
     * @param {string} username The username of the user.
     * @param {string} token The token generated for the user.
     */
    constructor(
        id,
        username,
        name,
        email,
        profileImage,
        type,
        upcomingConcerts,
        attendedConcerts,
        communitiesJoined,
        postsDone,
        token
    ) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.profileImage = profileImage;
        this.type = type;
        this.upcomingConcerts = upcomingConcerts;
        this.attendedConcerts = attendedConcerts;
        this.communitiesJoined = communitiesJoined;
        this.postsDone = postsDone;
        this.token = token;
    }
}