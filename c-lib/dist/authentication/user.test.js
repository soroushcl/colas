import { authenticatedUser, userStatus, } from './User.js';
test('can create an authenticated user from user info', () => {
    const user = {
        email: 'test@test.com',
        password: '123',
        id: '1',
        firstName: 'Donald',
        name: 'Donald',
        state: 'Ontario',
        dogCount: 4,
        lastName: 'Duck',
        status: userStatus.userInfo,
        // disabled: false
    };
    const authUser = authenticatedUser(user);
    expect(authUser).toEqual({
        email: 'test@test.com',
        id: '1',
        firstName: 'Donald',
        state: 'Ontario',
        dogCount: 4,
        status: 'USERINFO',
        // lastName: 'Duck',
    });
});
//# sourceMappingURL=user.test.js.map