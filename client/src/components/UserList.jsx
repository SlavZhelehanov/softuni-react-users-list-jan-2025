import { use, useEffect, useState } from "react";

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
    const [printedUsers, setPrintedUsers] = useState([]);
    const [showCreateEditForm, setShowCreateEditForm] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(null);
    const [showDeleteUser, setShowDeleteUser] = useState(null);
    const [showEditUser, setShowEditUser] = useState(null);
    const [sortAscending, setSortAscending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        setError(null);

        userService.getAllUsers().then(users => {
            setTotalPages(Math.ceil(users.length / itemsPerPage));
            setItemsPerPage(itemsPerPage);

            setPrintedUsers(oldState => [...users.slice(0, itemsPerPage)]);
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
            setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));

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
            setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));

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
            setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));

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
            setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));

            if (!formValues.search || !formValues.criteria) return;

            setUsers(oldState => {
                return oldState.filter(u => u[formValues.criteria].toLowerCase().includes(formValues.search.toLowerCase()));
            });
            setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));
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
        
        setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));
    }

    function changeItemsCountHandler(items) {
        setTotalPages(Math.ceil(users.length / items));
        setItemsPerPage(items);
        setPrintedUsers(users.slice(items * (currentPage - 1), items * currentPage));
        console.log(printedUsers.length);
        
    }

    function navigatePageArrow(direction) {
        let skip = 0, take = itemsPerPage;

        switch (direction) {
            case "First Page": {
                setCurrentPage(1);
                setPrintedUsers(users.slice(0, itemsPerPage));
                break;
            }
            case "Previous Page": {
                if (1 < currentPage) {
                    setCurrentPage(oldState => oldState - 1);
                    setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));
                }
                break;
            }
            case "Next Page": {
                if (currentPage < totalPages) {
                    setCurrentPage(oldState => oldState + 1);
                    setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));
                }
                break;
            }
            case "Last Page": {
                setCurrentPage(totalPages);
                setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1)));
                break;
            }
            default: { break; }
        }

        setLoading(false);
        setPrintedUsers(users.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage));
    }    
    console.log(users.length % 15);
    

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
                            {printedUsers.map(user => (
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
                <Pagination
                    onChangeItems={changeItemsCountHandler}
                    onArrowClick={navigatePageArrow}
                    totalPages={totalPages}
                    currentPage={currentPage}
                />
            </section>
        </>
    );
}