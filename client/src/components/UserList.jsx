import { useEffect, useState } from "react";

import userService from "../services/userService";

import Pagination from "./Pagination";
import Search from "./Search";
import UserListItem from "./UserListItem";
import UserCreateEditForm from "./UserCreateEditForm";
import UserInfo from "./UserInfo";
import UserDelete from "./UserDelete";
import arrow from "./TableHadeArrows";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [showCreateEditForm, setShowCreateEditForm] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(null);
    const [showDeleteUser, setShowDeleteUser] = useState(null);
    const [showEditUser, setShowEditUser] = useState(null);
    const [sortAscending, setSortAscending] = useState(false);

    useEffect(() => {
        // Fetch all users from the server
        userService.getAllUsers().then(users => {
            setUsers(users);
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

        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        const newUser = await userService.createNewUser(formValues);

        setUsers(oldState => [...oldState, newUser]);

        setShowCreateEditForm(false);
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
        await userService.deleteUser(showDeleteUser);

        setUsers(oldState => oldState.filter(u => u._id !== showDeleteUser));

        setShowDeleteUser(null);
    }

    function editUserHandler(userId) {
        setShowEditUser(userId);
    }

    async function saveEditUserClickHandler(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        await userService.updateUser(showEditUser, formValues);

        setUsers(oldState => {
            return oldState.map(u => {
                if (u._id === showEditUser) return { formValues, _id: showEditUser };
                return u;
            });
        });

        setShowEditUser(null);
    }

    async function findSearchingHandler(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData);

        formValues.search = formValues.search.trim();
        formValues.criteria = formValues.criteria.trim();

        const allUsers = await userService.getAllUsers()
        setUsers(oldState => [...allUsers]);

        if (!formValues.search || !formValues.criteria) return;

        setUsers(oldState => {
            return oldState.filter(u => u[formValues.criteria].toLowerCase().includes(formValues.search.toLowerCase()));
        });
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
                {/* <!-- Search bar component --> */}
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

                {/* <!-- Table component --> */}
                <div className="table-wrapper">
                    {/* <!-- Overlap components  --> */}

                    {/* <!-- <div className="loading-shade"> --> */}
                    {/* <!-- Loading spinner  --> */}
                    {/* <!-- <div className="spinner"></div> --> */}
                    {/* <!-- No users added yet  --> */}

                    {/* <div className="table-overlap">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="triangle-exclamation"
                className="svg-inline--fa fa-triangle-exclamation Table_icon__+HHgn"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                ></path>
              </svg>
              <h2>There is no users yet.</h2>
            </div> */}

                    {/* <!-- No content overlap component  --> */}

                    {/* <div className="table-overlap">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="triangle-exclamation"
                className="svg-inline--fa fa-triangle-exclamation Table_icon__+HHgn"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                ></path>
              </svg>
              <h2>Sorry, we couldn't find what you're looking for.</h2>
            </div> */}

                    {/* <!-- On error overlap component  --> */}

                    {/* <div className="table-overlap">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="triangle-exclamation"
                className="svg-inline--fa fa-triangle-exclamation Table_icon__+HHgn"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                ></path>
              </svg>
              <h2>Failed to fetch</h2>
            </div> */}
                    {/* <!-- </div> --> */}

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