import { Order, User} from 'c-lib';

export abstract class OrderRepository {
  // abstract addOrder(subscription: Order): Promise<Order> | Promise<never>;
  // abstract generateOrder(subscription: Order): Promise<Order> | Promise<never>;
  abstract findOrdersByUserId(userId: User['id']): Promise<Order[]> | Promise<never>;
}
