const baseUrl = "http://localhost:3030/jsonstore/users";

export default {
    async getAllUsers() {
        const users = await fetch(baseUrl).then(res => res.json());
        return Object.values(users);
    },
    async createNewUser(user) {
        const response = await fetch(baseUrl, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        return await response.json();
    }
}