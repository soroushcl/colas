import {UserRepository} from '../UserRepository';
import {ForgotPasswordUser, User,} from 'c-lib';
import {Collection, Db, ObjectId} from "mongodb";
import {fromMongo, mongoObj, toMongo} from "@utils/mongoUtils";


export class UserMongoRepository extends UserRepository {
  private userCollection: Collection;
  private forgotPasswordCollection: Collection;

  constructor(db: Db, userCollectionName: string, forgotPasswordCollectionName: string) {
    super();
    this.userCollection = db.collection(userCollectionName);
    this.forgotPasswordCollection = db.collection(forgotPasswordCollectionName);
  }

  async findUserById(id: User["id"]): Promise<User | null> {
    const mongoUser = await this.userCollection.findOne({"_id": new ObjectId(id)});
    if(mongoUser){
      return fromMongo(( mongoUser as unknown as mongoObj<User>));
    }else{
      return null;
    }
  }

  async findUserByEmail(email: User["email"]): Promise<User | null> {
    console.log("findUserByEmail", email)
    // const mongoUser = await this.userCollection.findOne({"email": email});
    const mongoUser = await this.userCollection.findOne({"email": email});
    if(mongoUser){
      return fromMongo(( mongoUser as unknown as mongoObj<User>));
    }else{
      return null;
    }
  }

  // async getUsersByOrganization(organizationId: Organization["id"]): Promise<User[] | null> {
  //   const mongoUsers = await this.userCollection.find({organization: organizationId}).toArray();
  //   return mongoUsers.map(u => fromMongo(u as unknown as mongoObj<User>));
  // }

  async addUser(newUser: User): Promise<User> {
    const isEmailTaken = await this.userCollection.findOne({"email": newUser.email})
    if (isEmailTaken) {throw new Error('email already taken');}

    await this.userCollection.insertOne(toMongo(newUser));
    return newUser

  }

  async updateUser(updatedUser: User): Promise<User | null> {
    await this.userCollection.findOneAndUpdate({_id: new ObjectId(updatedUser.id)}, {$set: toMongo(updatedUser)},{returnDocument: 'after'});
    return updatedUser;
  }

  // async updateCustomer(updatedUser: User): Promise<User | null> {
  //   await this.userCollection.findOneAndUpdate({_id: new ObjectId(updatedUser.id)}, {$set: toMongo(updatedUser)},{returnDocument: 'after'});
  //   return updatedUser;
  // }

  // async enableDisableUser(userId: User["id"], activate: boolean): Promise<boolean> {
  //   try {
  //     const deletedUser = await this.userCollection.findOneAndUpdate({_id: new ObjectId(userId)}, {$set: {status: activate ? userStatus.active: userStatus.deactive}});
  //     return !!deletedUser;
  //   } catch (e: any) {
  //     throw e;
  //   }
  // }

  async createForgotPassword(newForgotPasswordUser: ForgotPasswordUser): Promise<ForgotPasswordUser | null> {
    const mongoForgotPassword = await this.forgotPasswordCollection.findOne({"user": newForgotPasswordUser.user, isDone: false, expiration: {$gt: new Date()}});
    if(mongoForgotPassword){
      return fromMongo(mongoForgotPassword as unknown as mongoObj<ForgotPasswordUser>) || null;
    }
    await this.forgotPasswordCollection.insertOne(toMongo(newForgotPasswordUser));
    return newForgotPasswordUser;

  }

  async getForgotPasswordById(forgotPasswordId: ForgotPasswordUser["id"]): Promise<ForgotPasswordUser | null> {
    const mongoForgotPassword = await this.forgotPasswordCollection.findOne({_id: new ObjectId(forgotPasswordId)});
    if(!mongoForgotPassword){
      return null;
    }
    return fromMongo(mongoForgotPassword as unknown as mongoObj<ForgotPasswordUser>);
  }

  async doneForgotPassword(forgotPasswordId: ForgotPasswordUser["id"]): Promise<ForgotPasswordUser | null> {
    const forgotPasswordMongo = await this.forgotPasswordCollection.findOne({_id: new ObjectId(forgotPasswordId)});
    if(!forgotPasswordMongo){
      return null;
    }
    const forgotPassword = fromMongo(forgotPasswordMongo as unknown as mongoObj<ForgotPasswordUser>) || null;
    if(!forgotPassword.isDone && forgotPassword.expiration.getTime() > new Date().getTime() ){
      forgotPassword.isDone = true;
      await this.userCollection.findOneAndUpdate({_id: new ObjectId(forgotPasswordId)}, {$set: {isDone: true}},{returnDocument: 'after'});
      return forgotPassword;
    }else{
      return null;
    }
  }

  // async numberOfUsersByOrganization(organizationId:Organization["id"]): Promise<number | null> {
  //   try{
  //     return await this.userCollection.countDocuments({organization: organizationId});
  //   }catch(e) {
  //     throw e;
  //   }
  // }

  async createId(): Promise<User["id"]> {
    return new ObjectId().toString()

  }
}
