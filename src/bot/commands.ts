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
    publish: '/publish',
    unpublish: '/unpublish',
    setPhoto: '/setPhoto',
    setType: '/setType',
    setUnitType: (type: number) => `/setType/${type}`,
    setUnitFoundationDate: '/setDate',
    delete: '/delete',
    setName: '/setName',
    setDescription: '/setDescription',
    managementQuery: (entType: string, entId?: string, action?: string) =>
        entId == undefined
            ? `/management/${entType}`
            : `/management/${entType}/${entId}${action}`,
    approveQuery: (entType: string) => `/registration/approve/${entType}`,
    rejectQuery: (entType: string) => `/registration/reject/${entType}`,
    banQuery: (entType: string) => `/registration/ban/${entType}`
}