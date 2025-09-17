export const botCommands = {
    start: '/start',
    randomWod: '/randomwod',
    registerUnit: '/registerunit',
    registerVeteranBusiness: '/registerveteranbusiness',
    needMoreFunctionality: '/needmorefunctionality',
    approveRequest: '/approve',
    rejectRequest: '/reject',
    management: '/management',
    registration: '/registration',
    generateOtp: '/generateOtp',
    showOtp: '/showOtp',
    managementQuery: (entType: string, entId: string, action: string) =>
        `/management/${entType}/${entId}/${action}`,
    approveQuery: (entType: string) => `/registration/approve/${entType}`,
    rejectQuery: (entType: string) => `/registration/reject/${entType}`,
    banQuery: (entType: string) => `/registration/ban/${entType}`
}