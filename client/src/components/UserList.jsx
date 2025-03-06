import { useEffect, useState } from "react";

import userService from "../services/userService";

import Pagination from "./Pagination";
import Search from "./Search";
import UserListItem from "./UserListItem";
import UserCreateEditForm from "./UserCreateEditForm";
import UserInfo from "./UserInfo";
import UserDelete from "./UserDelete";
import arrow from "./TableHadeArrows";
import NoUsersYet from "./NoUsersYet";
import LoadingSpinner from "./LoadingSpinner";
import OnError from "./OnError";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [showCreateEditForm, setShowCreateEditForm] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(null);
    const [showDeleteUser, setShowDeleteUser] = useState(null);
    const [showEditUser, setShowEditUser] = useState(null);
    const [sortAscending, setSortAscending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        userService.getAllUsers().then(users => {
            setLoading(false);
            setUsers(users);
        }).catch(err => {
            setLoading(false);
            setError(err);
        });
    }, []);

    function createNewUserHandler(params) {
        setShowCreateEditForm(true);
    }

    function closeCreateEditFormHandler() {
        setShowCreateEditForm(false);
        setShowEditUser(null);
    }

    async function saveCreateEditFormHandler(e) {
        e.preventDefault();

        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        try {
            const newUser = await userService.createNewUser(formValues);

            setLoading(false);
            setUsers(oldState => [...oldState, newUser]);

            setShowCreateEditForm(false);
        } catch (error) {
            setLoading(false);
            setError(error);
        }
    }

    function userInfoClickHandler(userId) {
        setShowUserInfo(userId);
    }

    function closeUserInfoHandler() {
        setShowUserInfo(null);
    }

    function deleteUserHandler(userId) {
        setShowDeleteUser(userId);
    }

    function closeDeleteUserHandler() {
        setShowDeleteUser(null);
    }

    async function userDeleteHandler() {
        setLoading(true);
        setError(null);

        try {
            await userService.deleteUser(showDeleteUser);

            setLoading(false);
            setUsers(oldState => oldState.filter(u => u._id !== showDeleteUser));

            setShowDeleteUser(null);
        } catch (error) {
            setLoading(false);
            setError(error);
        }
    }

    function editUserHandler(userId) {
        setShowEditUser(userId);
    }

    async function saveEditUserClickHandler(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        try {
            await userService.updateUser(showEditUser, formValues);

            setLoading(false);
            setUsers(oldState => {
                return oldState.map(u => {
                    if (u._id === showEditUser) return { formValues, _id: showEditUser };
                    return u;
                });
            });

            setShowEditUser(null);
        } catch (error) {
            setLoading(false);
            setError(error);
        }
    }

    async function findSearchingHandler(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        formValues.search = formValues.search.trim();
        formValues.criteria = formValues.criteria.trim();

        try {
            const allUsers = await userService.getAllUsers();

            setLoading(false);
            setUsers(oldState => [...allUsers]);

            if (!formValues.search || !formValues.criteria) return;

            setUsers(oldState => {
                return oldState.filter(u => u[formValues.criteria].toLowerCase().includes(formValues.search.toLowerCase()));
            });
        } catch (error) {
            setLoading(false);
            setError(error);
        }
    }

    function changeSortingByCriteria(criteria) {
        setSortAscending(oldState => !oldState);

        if (sortAscending && criteria === "createdAt") {
            setUsers(oldState => {
                return oldState.sort((a, b) => new Date(a[criteria]) - new Date(b[criteria]));
            });
        } else if (sortAscending) {
            setUsers(oldState => {
                return oldState.sort((a, b) => a[criteria].toLowerCase().localeCompare(b[criteria].toLowerCase()));
            });
        } else if (criteria === "createdAt") {
            setUsers(oldState => {
                return oldState.sort((a, b) => new Date(b[criteria]) - new Date(a[criteria]));
            });
        } else {
            setUsers(oldState => {
                return oldState.sort((a, b) => b[criteria].toLowerCase().localeCompare(a[criteria].toLowerCase()));
            });
        }
    }

    return (
        <>
            <section className="card users-container">
                <Search onSearch={findSearchingHandler} />

                {showCreateEditForm && (
                    <UserCreateEditForm
                        onClose={closeCreateEditFormHandler}
                        onSave={saveCreateEditFormHandler}
                    />
                )}

                {showUserInfo && (
                    <UserInfo
                        id={showUserInfo}
                        onClose={closeUserInfoHandler}
                    />
                )}

                {showDeleteUser && (
                    <UserDelete
                        id={showDeleteUser}
                        onClose={closeDeleteUserHandler}
                        onDelete={userDeleteHandler}
                    />
                )}

                {showEditUser && (
                    <UserCreateEditForm
                        userId={showEditUser}
                        onClose={closeCreateEditFormHandler}
                        onEdit={saveEditUserClickHandler}
                    />
                )}

                <div className="table-wrapper">
                    {loading && <LoadingSpinner />}

                    {users.length === 0 && loading && <NoUsersYet />}

                    {error && <OnError />}

                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    Image
                                </th>
                                <th onClick={() => changeSortingByCriteria("firstName")}>
                                    First name{sortAscending ? arrow.up : arrow.down}
                                </th>
                                <th onClick={() => changeSortingByCriteria("lastName")}>
                                    Last name{sortAscending ? arrow.up : arrow.down}
                                </th>
                                <th onClick={() => changeSortingByCriteria("email")}>
                                    Email{sortAscending ? arrow.up : arrow.down}
                                </th>
                                <th onClick={() => changeSortingByCriteria("phoneNumber")}>
                                    Phone{sortAscending ? arrow.up : arrow.down}
                                </th>
                                <th onClick={() => changeSortingByCriteria("createdAt")}>
                                    Created{sortAscending ? arrow.up : arrow.down}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    onInfoClick={userInfoClickHandler}
                                    onDeleteClick={deleteUserHandler}
                                    onEditClick={editUserHandler}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* <!-- New user button  --> */}
                <button className="btn-add btn" onClick={createNewUserHandler}>Add new user</button>

                {/* <!-- Pagination component  --> */}
                <Pagination />
            </section>
        </>
    );
}