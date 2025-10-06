import { OrderRepository } from '../OrderRepository';
import { Order, User } from 'c-lib';

export class OrderRepositoryInMemory extends OrderRepository {

  // generateOrder(subscription: Order): Promise<Order> | Promise<never> {
  //   console.log('In Memory generateOrders dog', subscription.id)
  //   throw new Error('Method not implemented.3');
  // }

  // addOrder(subscription: Order): Promise<Order> | Promise<never> {
  //   return new Promise((resolve, reject) => {
  //     this.db.push(subscription as Order);
  //     resolve(subscription as Order);
  //   });
  // }

  private db: Order[];

  constructor(db: Order[]) {
    super();
    this.db = db;
  }

  findOrdersByUserId(userId: User['id']): Promise<Order[]> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => d.userId === userId));
    });
  }

}