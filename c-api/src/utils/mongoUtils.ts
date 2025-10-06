import {
  ObjectId,
  MongoError,
  MongoNotConnectedError,
  MongoAPIError,
  MongoMissingCredentialsError,
  MongoNetworkTimeoutError,
  MongoExpiredSessionError,
  MongoServerClosedError,
  MongoTopologyClosedError,
  MongoClient,
  Collection,
  OptionalUnlessRequiredId,
  ModifyResult,
  Filter,
  UpdateFilter
} from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { HttpStatusCode } from "./constants";

export type dataModelId = {
  id: string;
}

export type mongoId = {
  _id: ObjectId;
}

export type mongoObj<T extends dataModelId> = Omit<T, "id"> & { _id: ObjectId }; //T is the actual Object in library (such as User, Assessment, etc...). So we create mongoObj and all combos from that.
export type comboObjectFromDataModel<T extends dataModelId> = Partial<T> & { _id: ObjectId };
export type comboObjectFromMongoModel<T extends mongoId> = Partial<T> & { id: string };

export function toMongo<T extends dataModelId>(obj: T): mongoObj<T> {
  const tempT: comboObjectFromDataModel<T> = { ...obj, _id: new ObjectId(obj.id) }
  delete tempT.id;
  return tempT as mongoObj<T>;
}

export function fromMongo<T extends dataModelId>(mObj: mongoObj<T>): T {
  const tempT: comboObjectFromMongoModel<mongoObj<T>> = { ...mObj, id: mObj._id.toString() };
  delete tempT._id;
  return tempT as unknown as T;
}

export function createMongoId(): string {
  return new ObjectId().toString();
}

//TODO: Consider removing this class from any Repositories that use it. Composition is better than inheritance.
export abstract class MongoRepository {
  readonly enabledDocumentFilter = { disabled: { $in: [null, undefined, false] }};

  createId(): string {
    return createMongoId();
  }

  getErrorCodeFromMongoError(error: MongoError) {
    if (error instanceof MongoMissingCredentialsError) {
      return HttpStatusCode.UNAUTHORIZED;
    } else if (error instanceof MongoNotConnectedError) {
      return HttpStatusCode.SERVICE_UNAVAILABLE;
    } else if (error instanceof MongoExpiredSessionError) {
      return HttpStatusCode.SERVICE_UNAVAILABLE;
    } else if (error instanceof MongoServerClosedError) {
      return HttpStatusCode.SERVICE_UNAVAILABLE;
    } else if (error instanceof MongoTopologyClosedError) {
      return HttpStatusCode.SERVICE_UNAVAILABLE;
    } else if (error instanceof MongoNetworkTimeoutError) {
      return HttpStatusCode.REQUEST_TIMEOUT;
    } else if (error instanceof MongoAPIError) {
      return HttpStatusCode.BAD_REQUEST;
    }
    return HttpStatusCode.INTERNAL_SERVER_ERROR;
  }

  /**
   * Helper function to interpret the results of a findOneAndUpdate.
   * @param modifyResult - Result returned by findOneAndUpdate operation.
   * @returns True if the document was found and updated. Returns false otherwise.
   */
  wasDocumentFoundAndUpdated(modifyResult: ModifyResult): boolean {
    return !!modifyResult.ok && !modifyResult.value;  
  }
}

/**
 * Class representing a repository that is able to perform multiple basic CRUD operations on a MongoDB collection.
 * This is intended to be used inside of any MongoRepository to execute common database operations and cut down on duplicated code and mistakes.
 */
export class BaseMongoRepository<CollectionDocument extends dataModelId> {
  readonly enabledDocumentFilter = { disabled: { $in: [null, undefined, false] } };
  protected collection: Collection<mongoObj<CollectionDocument>>;

  constructor(collection: Collection<mongoObj<CollectionDocument>>) {
    this.collection = collection;
  }

  public createId(): string {
    return createMongoId();
  }

  public async createDocument(newDocument: CollectionDocument): Promise<CollectionDocument> {
    try {
      const convertedNewDocument = toMongo(newDocument) as OptionalUnlessRequiredId<mongoObj<CollectionDocument>>;
      const createResult = await this.collection.insertOne(convertedNewDocument);
      if (!createResult.acknowledged) {
        throw Error('unable to create document to update');
      }
      return newDocument;
    } catch (e) {
      throw e;
    }
  }

  public async updateDocument(updatedDocument: CollectionDocument): Promise<CollectionDocument> {
    try {
      const filter = { _id: new ObjectId(updatedDocument.id), ...this.enabledDocumentFilter } as unknown as Filter<mongoObj<CollectionDocument>>;
      const result = await this.collection.findOneAndUpdate(filter, { $set: toMongo(updatedDocument) }, { returnDocument: "after" });
      if (this.wasDocumentFoundAndUpdated(result)) {
        throw Error('unable to find document to update');
      } else if (!result.ok) {
        throw Error('unable to update')
      }
      return updatedDocument;
    } catch (e) {
      throw e;
    }
  }

  public async deleteDocument(id: string): Promise<boolean> {
    try {
      const filter = { _id: new ObjectId(id), ...this.enabledDocumentFilter } as unknown as Filter<mongoObj<CollectionDocument>>;
      const updateFilter = { $set: { disabled: true } } as unknown as UpdateFilter<mongoObj<CollectionDocument>>;
      const result = await this.collection.findOneAndUpdate(filter, updateFilter);
      if (result.ok && !result.value) {
        throw Error('unable to find document to delete');
      } else if (!result.ok) {
        throw Error('unable to delete')
      }
      return !!result.value;
    } catch (e) {
      throw e;
    }
  }

  public async findDocumentById(id: string): Promise<CollectionDocument | null> {
    try {
      const filter = { _id: new ObjectId(id), ...this.enabledDocumentFilter } as unknown as Filter<mongoObj<CollectionDocument>>;
      const foundDocument = await this.collection.findOne(filter);
      if (!foundDocument) {
        return null;
      }
      return fromMongo(foundDocument as unknown as mongoObj<CollectionDocument>);
    } catch (e) {
      throw e;
    }
  }

  public async findAllDocuments(): Promise<CollectionDocument[]> {
    try {
      const filter = { ...this.enabledDocumentFilter } as unknown as Filter<mongoObj<CollectionDocument>>;
      const foundDocuments = await this.collection.find(filter).toArray();
      return foundDocuments.map(doc => fromMongo(doc as unknown as mongoObj<CollectionDocument>));
    } catch (e) {
      throw e;
    }
  }

  public async getNumberOfDocuments(): Promise<number> {
    try {
      const documentCount = await this.collection.countDocuments(this.enabledDocumentFilter);
      return documentCount;
    } catch (e) {
      throw e;
    }
  }

  private wasDocumentFoundAndUpdated(modifyResult: ModifyResult<mongoObj<CollectionDocument>>): boolean {
    return !!modifyResult.ok && !modifyResult.value;
  }
}


/**
 * Creates a MongoMemoryServer.
 * This function is used for testing. Do not use for production code.
 * @param dbName 
 * @param collectionName 
 * @param documents - Must have either an '_id' or an 'id'
 * @returns
 */
export const createInMemoryMongoDB = async (dbName: string, collectionName: string, documents: any[]) => {
  const documentsToInsert = (() => {
    if (documents.length < 0) {
      return [];
    }
    const firstDoc = documents[0];
    if ('id' in firstDoc) {
      return documents.map((entry) => { return toMongo(entry); });
    }
    return documents;
  })();

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const client = new MongoClient(uri, { connectTimeoutMS: 5, socketTimeoutMS: 5, serverSelectionTimeoutMS: 10, maxIdleTimeMS: 10 });
 
  await client.connect()

  const db = client.db(dbName);
  await db.collection(collectionName).insertMany(documentsToInsert);

  return { db, mongoServer, client };
}

/**
 * Takes a MongoError and provides the HTTP status code associated with the error
 * @param error - MongoError that requires conversion
 * @returns A number that corresponds to an HTTP status code
 */
export function getHttpStatusCodeCodeFromMongoError(error: MongoError) {
  if (error instanceof MongoMissingCredentialsError) {
    return HttpStatusCode.UNAUTHORIZED;
  } else if (error instanceof MongoNotConnectedError) {
    return HttpStatusCode.SERVICE_UNAVAILABLE;
  } else if (error instanceof MongoExpiredSessionError) {
    return HttpStatusCode.SERVICE_UNAVAILABLE;
  } else if (error instanceof MongoServerClosedError) {
    return HttpStatusCode.SERVICE_UNAVAILABLE;
  } else if (error instanceof MongoTopologyClosedError) {
    return HttpStatusCode.SERVICE_UNAVAILABLE;
  } else if (error instanceof MongoNetworkTimeoutError) {
    return HttpStatusCode.REQUEST_TIMEOUT;
  } else if (error instanceof MongoAPIError) {
    return HttpStatusCode.BAD_REQUEST;
  }
  return HttpStatusCode.INTERNAL_SERVER_ERROR;
}
