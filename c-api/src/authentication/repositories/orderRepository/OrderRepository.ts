import { Address, Dog, Order, OrderDetail, User} from 'c-lib';

export abstract class OrderRepository {
  // abstract addOrder(subscription: Order): Promise<Order> | Promise<never>;
  // abstract generateOrder(subscription: Order): Promise<Order> | Promise<never>;
  abstract findOrdersByUserId(userId: User['id']): Promise<Order[]> | Promise<never>;
  abstract findActiveOrder(userId: User['id'], dog: Dog['id']): Promise<Order> | Promise<never>;
  abstract addOrder(order: Order): Promise<Order> | Promise<never>;
  abstract updateActiveOrderInfo(dog: Dog['id'], detail: OrderDetail, price: number, currentPeriodEnd: Date): Promise<Order> | Promise<never>;
  abstract updateUserShipping(userId: User['id'], shippingAddress: Address): Promise<true> | Promise<never>;
  abstract findOrderByInvoiceNumber(userId: User['id'], invoiceNumber: string): Promise<Order | null> | Promise<never>;
  abstract findOrderByUserIdAndDogIdAndStatus(userId: User['id'], dogId: Dog['id'], statuses: string[]): Promise<Order | null> | Promise<never>;
  abstract updateOrder(userId: User['id'], filter: any, update: any): Promise<Order | null> | Promise<never>;
}
