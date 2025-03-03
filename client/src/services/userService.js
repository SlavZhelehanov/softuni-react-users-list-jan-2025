const baseUrl = "http://localhost:3030/jsonstore/users";

export default {
    async getAllUsers() {
        const users = await fetch(baseUrl).then(res => res.json());
        return Object.values(users);
    }
}