import { ObjectId, Db, MongoClient, Collection, MongoServerSelectionError, MongoNotConnectedError } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { dataModelId, BaseMongoRepository as BaseMongoRepository, createInMemoryMongoDB, mongoObj } from "./mongoUtils";

const dbName = 'test';
const collectionName = 'sample';

const createIdsArray = (quantity: number) => {
  if (quantity <= 0) {
    return [];
  }
  const entries: Required<dataModelId>[] = [];
  for (let i = 0; i < quantity; i++) {
    const basicEntry: dataModelId = { id: new ObjectId().toString() };
    entries.push(basicEntry);
  }
  return entries;
}

describe('BaseMongoRepository connected to MongoMemoryServer', () => {
  const testDocuments = createIdsArray(1);
  test('can be instantiated', async () => {
    const { db, mongoServer, client } = await createInMemoryMongoDB(dbName, collectionName, testDocuments);
    const collection: Collection<mongoObj<dataModelId>> = db.collection(collectionName);
    const repo = new BaseMongoRepository(collection);
    expect(repo).toBeInstanceOf(BaseMongoRepository<dataModelId>);
    await client.close()
    await mongoServer.stop()
  });
});

describe('BaseMongoRepository connected to MongoMemoryServer', () => {
  const testDocuments = createIdsArray(1);
  test('throws an error if the server is stopped.', async () => {
    const { db, mongoServer, client } = await createInMemoryMongoDB(dbName, collectionName, testDocuments);
    const collection: Collection<mongoObj<dataModelId>> = db.collection(collectionName);
    const repo = new BaseMongoRepository(collection);
    expect(mongoServer.state).toBe('running');
    await mongoServer.stop({ force: true })
    expect(mongoServer.state).toBe('stopped');
    await expect(repo.getNumberOfDocuments()).rejects.toBeInstanceOf(MongoServerSelectionError);
    await client.close();
  });
  test('throws an error if the connection is closed.', async () => {
    const { db, mongoServer, client } = await createInMemoryMongoDB(dbName, collectionName, testDocuments);
    const collection: Collection<mongoObj<dataModelId>> = db.collection(collectionName);
    const repo = new BaseMongoRepository(collection);
    await client.close(true);
    await expect(repo.getNumberOfDocuments()).rejects.toBeInstanceOf(MongoNotConnectedError);
    mongoServer.stop();
  });
});


describe('BaseMongoRepository',
  () => {
    const testDocuments = createIdsArray(8);
    let db: Db;
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let repo: BaseMongoRepository<dataModelId>;
    let midPointIndex: number;

    beforeEach(async () => {
      const dbMongo = await createInMemoryMongoDB(dbName, collectionName, testDocuments);
      db = dbMongo.db;
      mongoServer = dbMongo.mongoServer;
      client = dbMongo.client;
      const collection: Collection<mongoObj<dataModelId>> = db.collection(collectionName);
      repo = new BaseMongoRepository(collection);
      midPointIndex = Math.floor((testDocuments.length - 1) / 2);
    });

    afterEach(async () => {
      await client.close();
      await mongoServer.stop();
    });

    it(
      'can get the number of documents ',
      async () => {
        const count = await repo.getNumberOfDocuments();
        expect(count).toEqual(testDocuments.length);
      }
    );

    it(
      'can find all documents ',
      async () => {
        const documents = await repo.findAllDocuments();
        expect(documents.length).toEqual(testDocuments.length);
        expect(documents).toEqual(testDocuments);
      }
    );

    it(
      'can find a documents by id',
      async () => {
        expect(testDocuments.length).toBeGreaterThanOrEqual(0);

        let expectedDocument = testDocuments[0];
        let foundDocument = await repo.findDocumentById(expectedDocument.id);
        expect(foundDocument).toEqual(expectedDocument);

        expectedDocument = testDocuments[midPointIndex];
        foundDocument = await repo.findDocumentById(expectedDocument.id);
        expect(foundDocument).toEqual(expectedDocument);

        expectedDocument = testDocuments[testDocuments.length - 1];
        foundDocument = await repo.findDocumentById(expectedDocument.id);
        expect(foundDocument).toEqual(expectedDocument);
      }
    );

    it(
      'returns null if unable to find a document that matches the given id',
      async () => {
        const badId = new ObjectId().toString();
        const testDecarbAssessment = await repo.findDocumentById(badId);
        expect(testDecarbAssessment).toBeNull();
      }
    );

    it(
      'throws if the id does not match the format MongoDB expects',
      async () => {
        let badId = '';
        await expect(repo.findDocumentById(badId)).rejects.toThrow();
        badId = 'very_bad_id';
        await expect(repo.findDocumentById(badId)).rejects.toThrow();
      }
    );

    it('creates a new document that can be searched for after creation',
      async () => {
        const newDocument = { id: repo.createId() };

        const createResponse = await repo.createDocument(newDocument);
        expect(createResponse).toEqual(newDocument);

        const findResponse = await repo.findDocumentById(newDocument.id);
        expect(findResponse).not.toBeNull();
        expect(findResponse).toEqual(newDocument);

        const finalCount = await repo.getNumberOfDocuments();
        expect(finalCount).toEqual(testDocuments.length + 1);
      }
    );

    it('can add multiple documents',
      async () => {
        const newDocument1 = { id: repo.createId() };
        const newDocument2 = { id: repo.createId() };
        let documentCount = testDocuments.length;

        let createResponse = await repo.createDocument(newDocument1);
        expect(createResponse).toEqual(newDocument1);
        documentCount++;

        createResponse = await repo.createDocument(newDocument2);
        expect(createResponse).toEqual(newDocument2);
        documentCount++;

        let findResponse = await repo.findDocumentById(newDocument1.id);
        expect(findResponse).toEqual(newDocument1);

        findResponse = await repo.findDocumentById(newDocument2.id);
        expect(findResponse).toEqual(newDocument2);

        const finalCount = await repo.getNumberOfDocuments();
        expect(finalCount).toEqual(documentCount);
      }
    );

    it('throws if you add a document with an id that is already in use',
      async () => {
        const documentCount = testDocuments.length;

        let existingDocument = testDocuments[0];
        await expect(repo.createDocument(existingDocument)).rejects.toThrow();
        expect(await repo.getNumberOfDocuments()).toEqual(documentCount);

        existingDocument = testDocuments[midPointIndex];
        await expect(repo.createDocument(existingDocument)).rejects.toThrow();
        expect(await repo.getNumberOfDocuments()).toEqual(documentCount);

        existingDocument = testDocuments[testDocuments.length - 1];
        await expect(repo.createDocument(existingDocument)).rejects.toThrow();
        expect(await repo.getNumberOfDocuments()).toEqual(documentCount);
      }
    );

    it('throws if you try to update an object that is not in the collection',
      async () => {
        const documentCount = testDocuments.length;
        const newDocument = { id: new ObjectId().toString() };
        await expect(repo.updateDocument(newDocument)).rejects.toThrow();
        expect(await repo.getNumberOfDocuments()).toEqual(documentCount);
      });


    it('updates a document',
      async () => {
        const documentCount = testDocuments.length;
        const originalDocument = testDocuments[0];
        const modifiedDocument = { id: originalDocument.id, name: 'Untitled' };

        const updateResult = await repo.updateDocument(modifiedDocument);
        expect(updateResult).toEqual(modifiedDocument);
        expect(updateResult).not.toEqual(originalDocument);

        const finalCount = await repo.getNumberOfDocuments();
        expect(finalCount).toEqual(documentCount);

        const allDocuments = await repo.findAllDocuments();
        expect(allDocuments).not.toEqual(testDocuments);
      });


    it(
      'updates a document multiple times',
      async () => {
        const documentCount = testDocuments.length;
        const originalDocument = testDocuments[0];
        const modifiedDocument1 = { id: originalDocument.id, name: 'Untitled' };
        expect(originalDocument).not.toEqual(modifiedDocument1);

        let updateResult = await repo.updateDocument(modifiedDocument1);
        expect(updateResult).toEqual(modifiedDocument1);
        expect(updateResult).not.toEqual(originalDocument);

        let currentCount = await repo.getNumberOfDocuments();
        expect(currentCount).toEqual(documentCount);

        let modifiedDocument2 = { id: originalDocument.id, name: 'Draft 1' };
        updateResult = await repo.updateDocument(modifiedDocument2);
        expect(updateResult).toEqual(modifiedDocument2);
        expect(updateResult).not.toEqual(modifiedDocument1);
        expect(updateResult).not.toEqual(originalDocument);

        const finalCount = await repo.getNumberOfDocuments();
        expect(finalCount).toEqual(documentCount);
      });


    it(
      'can delete a document',
      async () => {
        const entryId = testDocuments[0].id;
        const initialEntry = await repo.findDocumentById(entryId);
        expect(initialEntry).not.toBe(null);

        const deletedResult = await repo.deleteDocument(entryId);
        expect(deletedResult).toBeTruthy();
        expect(deletedResult).toEqual(true);

        let entryAfterDeletion = await repo.findDocumentById(entryId);
        expect(entryAfterDeletion).toBeNull();

        const finalCount = await repo.getNumberOfDocuments();
        expect(finalCount).toEqual(testDocuments.length - 1);
      }
    );

    it(
      'throws an error you try to delete a previously deleted document',
      async () => {
        const entryId = testDocuments[0].id;
        let initialEntry = await repo.findDocumentById(entryId);
        expect(initialEntry).not.toBeNull();

        const testDecarbAssessment = await repo.deleteDocument(entryId);
        expect(testDecarbAssessment).toBeTruthy();
        let entryAfterDeletion = await repo.findDocumentById(entryId);
        expect(entryAfterDeletion).toBeNull();
        const documentCount = await repo.getNumberOfDocuments();
        expect(documentCount).toEqual(testDocuments.length - 1);

        expect(async () => { await repo.deleteDocument(entryId); }).rejects.toThrow();
        let entryAfterSecondDeletion = await repo.findDocumentById(entryId);
        expect(entryAfterSecondDeletion).toBeNull();

        const finalCount = await repo.getNumberOfDocuments();
        expect(finalCount).toEqual(testDocuments.length - 1);
      }
    );

    it(
      'throws an error if the document to delete does not exist',
      async () => {
        const badId = new ObjectId().toString();
        let initialEntry = await repo.findDocumentById(badId);
        expect(initialEntry).toBe(null);
        expect(async () => { await repo.deleteDocument(badId); }).rejects.toThrow();
      }
    );
  }); // end of BaseMongoRepository functionality tests


describe('BaseMongoRepository with disabled/deleted documents',
  () => {
    const deletedDocuments = createIdsArray(4).map((value, index) => { return { id: value.id, disabled: true }; });
    const enabledDocuments = createIdsArray(5);
    const combinedDocuments = enabledDocuments.concat(deletedDocuments);
    let db: Db;
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let repo: BaseMongoRepository<dataModelId>;

    beforeEach(async () => {
      const dbMongo = await createInMemoryMongoDB(dbName, collectionName, combinedDocuments);
      db = dbMongo.db;
      mongoServer = dbMongo.mongoServer;
      client = dbMongo.client;
      const collection: Collection<mongoObj<dataModelId>> = db.collection(collectionName);
      repo = new BaseMongoRepository(collection);
    });

    afterEach(async () => {
      await client.close();
      await mongoServer.stop();
    });

    it('does not count deleted documents',
      async () => {
        const count = await repo.getNumberOfDocuments();
        expect(count).toEqual(enabledDocuments.length);
        expect(count).toEqual(combinedDocuments.length - deletedDocuments.length)
      }
    );

    it('does not find deleted documents when given an id',
      async () => {
        let deletedDocument = deletedDocuments[deletedDocuments.length - 1];

        let findResult = await repo.findDocumentById(deletedDocument.id);
        expect(findResult).toBeNull();

        deletedDocument = deletedDocuments[0];

        findResult = await repo.findDocumentById(deletedDocument.id);
        expect(findResult).toBeNull();
      }
    );

    it('does not show deleted documents when it finds all documents',
      async () => {
        const documents = await repo.findAllDocuments();
        expect(documents.length).toEqual(enabledDocuments.length);
        expect(documents.length).toBeLessThan(combinedDocuments.length);
        expect(documents).toEqual(enabledDocuments);
      }
    );

    it('throws when you try to create an object with the same id as a deleted object',
      async () => {
        const deletedDocument = deletedDocuments[0];
        const newDocument = { id: deletedDocument.id, disabled: false, name: 'NotADeletedDocument' };
        await expect(repo.createDocument(newDocument)).rejects.toThrow();

        let finalDocumentCount = await repo.getNumberOfDocuments();
        expect(finalDocumentCount).toEqual(enabledDocuments.length);
      }
    );

    it('does not allow you to enable a deleted object',
      async () => {
        const deletedDocument = deletedDocuments[0];
        const newDocument = { id: deletedDocument.id, disabled: false };
        await expect(repo.updateDocument(newDocument)).rejects.toThrow();

        let finalDocumentCount = await repo.getNumberOfDocuments();
        expect(finalDocumentCount).toEqual(enabledDocuments.length);
      }
    );
  }
);

