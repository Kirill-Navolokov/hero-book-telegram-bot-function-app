// import 'reflect-metadata';
// import { Container } from 'inversify';
// import { TYPES } from './typesMap';
// import { WodsRepository } from '../repositories/wodsRepository';
// import { Db, MongoClient } from 'mongodb';
// import { AppConfig } from '../appConfig';

// // Root container is created once per execution environment (reused across warm invocations)
// export const iocContainer = new Container({ defaultScope: 'Singleton' });

// iocContainer.bind<AppConfig>(TYPES.AppConfig).toConstantValue(loadConfig());
// iocContainer.bind<WodsRepository>(TYPES.WodsRepo).to(WodsRepository).inSingletonScope();
// iocContainer.bind<MongoClient>(TYPES.MongoClient).toDynamicValue(async (ctx) => {
//     const client = new MongoClient(process.env.MONGO_CONNECTION_STRING!);
//     await client.connect(); // cached by singleton scope

//     return client;
// }).inSingletonScope();

// function loadConfig(): AppConfig {
//     return { 
//         NODE_ENV: process.env.NODE_ENV ?? 'development',
//         MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING!,
//         DB_NAME: process.env.DB_NAME!,
//         DB_WODS_COLLECTION: process.env.DB_WODS_COLLECTION!
//     };
// }