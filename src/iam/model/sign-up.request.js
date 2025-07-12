export class SignUpRequest {
    constructor(username = '', password = '', name = '', email = '', profileImage = '', type = 'Fan') {
        this.username = username
        this.password = password
        this.name = name
        this.email = email
        this.profileImage = profileImage
        this.type = type  // Enviar como "Fan" o "Artist", no como 1 o 2
    }
}
