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
    approveQuery: (requestId: string, entType: string) => `/registration/approve/${entType}`,
    rejectQuery: (requestId: string, entType: string) => `/registration/reject/${entType}`,
    banQuery: (requestId: string, entType: string) => `/registration/ban/${entType}`
}