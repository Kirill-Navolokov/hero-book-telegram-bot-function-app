import { ObjectId } from "mongodb";

export const botCommands = {
    start: '/start',
    randomWod: '/randomwod',
    registerUnit: '/registerunit',
    registerVeteranBusiness: '/registerveteranbusiness',
    needMoreFunctionality: '/needmorefunctionality',
    approveRequest: '/approve',
    rejectRequest: '/reject',
    banRequest: '/ban',
    registration: '/registration',
    approveQuery: (requestId: ObjectId, entType: string) => `/registration/approve/${entType}?requestId=${requestId}`,
    rejectQuery: (requestId: ObjectId, entType: string) => `/registration/reject/${entType}?requestId=${requestId}`,
    banQuery: (userId: number) => `/ban?userId=${userId}`
}