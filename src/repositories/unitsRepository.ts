import { Db, ObjectId, UpdateFilter } from "mongodb"
import { BaseRepository } from "./baseRepository"
import { UnitRegistration } from "../models/unitRegistration";
import { Unit } from "../models/unit";

export class UnitsRepository extends BaseRepository {
    constructor(db: Db) {
        super(db);
    }

    protected get collectionName(): string {
        return process.env.DB_UNITS_COLLECTION!;
    }

    public async createUnitFromRequest(request: UnitRegistration): Promise<Unit> {
        let unit: Unit = {
            _id: new ObjectId(),
            isPublished: false,
            name: request.name,
            passedSignUp: false,
            otp: this.generateOtp(),
            adminContact: {
                tgUserId: request.userId!,
                email: request.adminEmail
            }
        }

        const collection = this.getCollection<Unit>();
        const result = await collection.insertOne(unit, {forceServerObjectId: true});
        unit._id = result.insertedId;

        return unit;
    }
    

    public async generateNewOtp(id: ObjectId): Promise<string> {
        const otp = this.generateOtp();
        const updateQuery = {
            $set: {
                otp: otp,
                passedSignUp: false
            }
        };

        await this.updateUnit(id, updateQuery);

        return otp;
    }

    public async getOtp(id: ObjectId): Promise<string> {
        const collection = this.getCollection<Unit>();
        const unit = await collection.findOne({_id: id});

        return unit!.otp;
    }

    public async getUnitByAdminTgId(userId: number): Promise<Unit | null> {
        const collection = this.getCollection<Unit>();
        const result = await collection.findOne({'adminContact.tgUserId': userId});

        return result;
    }

    public async getUnitByAdminEmail(email: string): Promise<Unit | null> {
        const collection = this.getCollection<Unit>();
        const result = await collection.findOne({'adminContact.email': email});

        return result;
    }

    private async updateUnit(id: ObjectId, updateQuery: UpdateFilter<Unit>): Promise<void> {
        const collection = this.getCollection<Unit>();
        await collection.findOneAndUpdate({_id: id}, updateQuery);
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