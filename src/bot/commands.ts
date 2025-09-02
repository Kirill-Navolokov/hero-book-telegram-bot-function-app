import { ObjectId } from "mongodb";

export const botCommands = {
    start: '/start',
    randomWod: '/randomwod',
    registerUnit: '/registerunit',
    registerVeteranBusiness: '/registerveteranbusiness',
    needMoreFunctionality: '/needmorefunctionality',
    approveRequest: '/approve',
    rejectRequest: '/reject',
    ban: '/ban',
    registration: '/registration',
    approveQuery: (requestId: string, entType: string) => `/registration/approve/${entType}?requestId=${requestId}`,
    rejectQuery: (requestId: string, entType: string) => `/registration/reject/${entType}?requestId=${requestId}`,
    banQuery: (requestId: string, entType: string) => `/registration/ban/${entType}?requestId=${requestId}`
}