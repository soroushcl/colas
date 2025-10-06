import { User, userStatus } from "c-lib";

export function generateUserEntries(): User[] {
  return [
    {
      email: 'omid@colaskitchen.com',
      id: '1',
      password: '12345',
      name: 'Omid',
      firstName: 'Omid',
      state: "Ontario",
      dogCount: 4,
      status: userStatus.new,
      lastName: 'Taghavi',
      // disabled: false,
    }
  ];
}
