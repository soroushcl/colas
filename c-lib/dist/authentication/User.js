export var userStatus;
(function (userStatus) {
    userStatus["new"] = "NEW";
    userStatus["userInfo"] = "USERINFO";
    userStatus["registered"] = "REGISTERED";
})(userStatus || (userStatus = {}));
export function authenticatedUser(user) {
    const { id, email, name, firstName, state, dogCount, lastName, status,
    // disabled
     } = user;
    return {
        id,
        email,
        name,
        firstName,
        state,
        dogCount,
        lastName,
        status,
        // disabled,
    };
}
//# sourceMappingURL=User.js.map