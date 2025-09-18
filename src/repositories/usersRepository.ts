import { Db, ObjectId } from "mongodb";
import { BaseRepository } from "./baseRepository";
import { User } from "../models/user";
const emailUsernameIndexCollation = {locale:"en", strength:1}

export class UsersRepository extends BaseRepository {
    constructor(db: Db) {
        super(db);
    }

    protected get collectionName(): string {
        return process.env.DB_USERS_COLLECTION!;
    }

    public async getByEmail(email: string): Promise<User|null> {
        var collection = this.getCollection<User>();

        return collection.findOne(
            {email: email},
            {collation: emailUsernameIndexCollation});
    }

    public async getByTelegramId(userId: number): Promise<User|null> {
        var collection = this.getCollection<User>();

        return collection.findOne({tgUserId: userId});
    }

    public async create(newUser: User): Promise<User> {
        var collection = this.getCollection<User>();
        var result =  await collection.insertOne(newUser, {forceServerObjectId: true});
        newUser._id = result.insertedId;

        return newUser;
    }

    public async generateNewOtp(id: ObjectId): Promise<string> {
        const otp = this.generateOtp();
        const updateQuery = {
            $set: {
                otp: otp,
                passedSignUp: false
            }
        };
    
        const collection = this.getCollection<User>();
        await collection.findOneAndUpdate({_id: id}, updateQuery);
    
        return otp;
    }

    public async getOtp(id: ObjectId): Promise<string|undefined> {
        const collection = this.getCollection<User>();
        const user = await collection.findOne({_id: id});
    
        return user!.otp;
    }

    private generateOtp(length: number = 12): string {
        const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=";
        let password = "";
        for (let i = 0; i < length; i++) {
            const ind = Math.floor(Math.random() * char.length);
            password += char[ind];
        }

        return password;
    }
}