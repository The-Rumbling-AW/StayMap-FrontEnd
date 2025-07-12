export class Concert {
    constructor({
                    id = 0,
                    name = '',
                    genre = '',
                    platform = '', 
                    date = new Date(),
                    description = '',
                    image = '',
                    venue = {},
                    nameVenue = '',
                    address = '',
                    latitude = 0,
                    longitude = 0,
                    capacity = 0,
                    status = '',
                    attendees = []
                } = {}) {
        this.id = id;
        this.name = name;
        this.genre = genre;
        this.platform = platform; 
        this.date = new Date(date);
        this.description = description;
        this.image = image;
        this.status = status;
        this.attendees = attendees;


        // Si el backend devuelve venue anidado
        if (venue && typeof venue === 'object') {
            this.venueName = venue.nameVenue || '';
            this.venueAddress = venue.address || '';
            this.venueLat = venue.location?.latitude || 0;
            this.venueLng = venue.location?.longitude || 0;
            this.venueCapacity = venue.capacity || 0;
        } else {
            // fallback si viene plano
            this.venueName = nameVenue || '';
            this.venueAddress = address || '';
            this.venueLat = latitude || 0;
            this.venueLng = longitude || 0;
            this.venueCapacity = capacity || 0;
        }
    }
}
