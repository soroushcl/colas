import { createMongoId, toMongo } from '@utils/mongoUtils';
import { OrderRepository } from '../OrderRepository';
import { Address, Dog, Order, OrderDetail, OrderStatus, User, } from 'c-lib';
import { Collection, Db, ObjectId } from "mongodb";
// import { toMongo } from "@utils/mongoUtils";
// import { BreedRepository } from 'src/breeds/repositories';
// import { RecipeRepository } from '@auth/repositories/recipeRepository';
// import { DogRepository } from '@auth/repositories/dogRepository';

export class OrderMongoRepository extends OrderRepository {
  private orderCollection: Collection;

  constructor(db: Db, orderCollectionName: string) {
    super();
    this.orderCollection = db.collection(orderCollectionName);
  }

  shippingPrice = 20;

  // async addOrder(order: Order): Promise<Order> {
  //   console.log("addOrder")
  //   let inserted = await this.orderCollection.insertOne(toMongo(order));
  //   const newOrder = await this.orderCollection.findOne({ _id: inserted.insertedId })
  //   return newOrder as unknown as Order
  // }

  // async generateOrder(order: Order): Promise<Order> {
  //   console.log("generateOrder mongo")
  //   const dog = await this.dogRepo.findDogById(order.dog);
  //   if (!dog) {
  //     throw new Error(`Dog not found for id: ${order.dog}`);
  //   }
  //   // const dogPrice = await this.createDogDailyPrice(dog, priceVersion);
  //   // const recurring = this.recurringCalculator(dog, order);
  //   let tempRecipes: Recipe[]
  //   tempRecipes = [];
  //   for (let i = 0; i < dog.recipes.length; i++) {
  //     let recipe = await this.recipeRepo.findRecipeById(dog.recipes[i]);
  //     tempRecipes.push(recipe);
  //   }
  //   let res: Order = order;
  //   this.addOrder(order)
  //   return res;
  // }

  async findOrdersByUserId(userId: User['id']): Promise<Order[]> {
    // Support both legacy string owner ids and ObjectId-based owner refs
    const filter = ObjectId.isValid(userId as any)
      ? { userId: { $in: [userId as any, new ObjectId(userId as any)] } }
      : { userId: userId };
    const cursor = this.orderCollection.find(filter as any);
    const list = await cursor.toArray();
    return list as unknown as Order[];
  }

  async findActiveOrder(userId: User['id'], dog: Dog['id']): Promise<Order> {
    // Support both legacy string owner ids and ObjectId-based owner refs
    const filter = ObjectId.isValid(userId as any)
      ? { userId: { $in: [userId as any, new ObjectId(userId as any)] }, dog: { $in: [dog as any, new ObjectId(dog as any)] }, status: OrderStatus.active }
      : { userId: userId, dog: dog, status: OrderStatus.active };
    const cursor = this.orderCollection.findOne(filter as any);
    return cursor as unknown as Order;
  }

  async addOrder(order: Order): Promise<Order> {
    const normalizedOrder = this.ensureValidOrderId(order);
    const inserted = await this.orderCollection.insertOne(toMongo(normalizedOrder));
    const newOrder = await this.orderCollection.findOne({ _id: inserted.insertedId });
    return newOrder as unknown as Order;
  }

  async updateActiveOrderInfo(dog: Dog['id'], detail: OrderDetail, price: number, currentPeriodEnd: Date): Promise<Order> {
    const filter = ObjectId.isValid(dog as any)
      ? { dog: { $in: [dog as any, new ObjectId(dog as any)] }, status: OrderStatus.active }
      : { dog: dog, status: OrderStatus.active };
    const updatedOrder = await this.orderCollection.updateMany(filter, { $set: { detail, price, currentPeriodEnd } })
    return updatedOrder as unknown as Order;

  }

  async updateUserShipping(userId: User['id'], shipping: Address): Promise<true> {
    await this.orderCollection.updateMany({ userId: userId, $or: [{ status: 'active' }, { status: 'trialing' }, { status: 'aggregation' }] }, {
      $set: {
        shipping: shipping,
      }
    })
    return true
  }

  async findOrderByInvoiceNumber(userId: User['id'], invoiceNumber: string): Promise<Order | null> {
    const filter = ObjectId.isValid(userId as any)
      ? { userId: { $in: [userId as any, new ObjectId(userId as any)] }, invoiceNumber: invoiceNumber }
      : { userId: userId, invoiceNumber: invoiceNumber };
    const order = await this.orderCollection.findOne(filter as any);
    return order as unknown as Order | null;
  }

  async findOrderByUserIdAndDogIdAndStatus(userId: User['id'], dogId: Dog['id'], statuses: string[]): Promise<Order | null> {
    const filter = ObjectId.isValid(userId as any)
      ? { 
          userId: { $in: [userId as any, new ObjectId(userId as any)] }, 
          dog: { $in: [dogId as any, new ObjectId(dogId as any)] }, 
          status: { $in: statuses } 
        }
      : { userId: userId, dog: dogId, status: { $in: statuses } };
    const order = await this.orderCollection.findOne(filter as any);
    return order as unknown as Order | null;
  }

  async updateOrder(userId: User['id'], filter: any, update: any): Promise<Order | null> {
    const baseFilter = ObjectId.isValid(userId as any)
      ? { userId: { $in: [userId as any, new ObjectId(userId as any)] }, ...filter }
      : { userId: userId, ...filter };
    const result = await this.orderCollection.findOneAndUpdate(
      baseFilter,
      { $set: update },
      { returnDocument: 'after' }
    );
    return result as unknown as Order | null;
  }

  private ensureValidOrderId(order: Order): Order {
    if (order.id && ObjectId.isValid(order.id)) {
      return order;
    }
    return {
      ...order,
      id: createMongoId(),
    };
  }
}

