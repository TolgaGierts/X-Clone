export default function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past; // difference in milliseconds

    const diffInMinutes = Math.floor(diff / 1000 / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays >= 1) {
        return `${diffInDays} d`;
    } else if (diffInHours >= 1) {
        return `${diffInHours} hr`;
    } else {
        return `${diffInMinutes} min`;
    }
}