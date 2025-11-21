import { OrderRepository } from '../OrderRepository';
import { Dog, Order, OrderDetail, OrderStatus, User } from 'c-lib';

export class OrderRepositoryInMemory extends OrderRepository {
  updateActiveOrderInfo(dog: Dog['id'], detail: OrderDetail, price: number, currentPeriodEnd: Date): Promise<Order> | Promise<never> {
    throw new Error('Method not implemented.');
  }
  

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

  findActiveOrder(userId: User['id'], dog: Dog['id']): Promise<Order> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => (d.userId === userId) && (d.dog === dog) && (d.status === OrderStatus.active))[0]);
    });
  }

  findOrdersByUserId(userId: User['id']): Promise<Order[]> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => d.userId === userId));
    });
  }

  addOrder(order: Order): Promise<Order> | Promise<never> {
    return new Promise((resolve, reject) => {
      this.db.push(order as Order);
      resolve(order as Order);
    });
  }

}