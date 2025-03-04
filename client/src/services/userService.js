const baseUrl = "http://localhost:3030/jsonstore/users";

export default {
    async getAllUsers() {
        const users = await fetch(baseUrl).then(res => res.json());
        return Object.values(users);
    },
    async getOneUser(id) {
        return await fetch(`${baseUrl}/${id}`).then(res => res.json());
    },
    async createNewUser(user) {
        user = {
            ...user,
            address: {
                city: user.city,
                country: user.country,
                streetNumber: user.streetNumber,
                street: user.street,
            },
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString(),
        }

        const response = await fetch(baseUrl, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        return await response.json();
    }
}