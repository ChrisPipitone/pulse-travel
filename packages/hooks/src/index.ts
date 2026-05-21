// useSupabase is intentionally not exported — internal to this package only.
// Consumers get the client via SupabaseProvider, not by calling useSupabase directly.
export { SupabaseProvider }        from './SupabaseContext'

export { useSession }              from './useSession'
export { useSignIn }               from './useSignIn'
export { useSignOut }              from './useSignOut'
export { useTripData }             from './useTripData'
export { useJoinTrip }             from './useJoinTrip'
export { useRateActivity }         from './useRateActivity'
export { useAddActivity }          from './useAddActivity'
export { useCompatibilityMatrix }  from './useCompatibilityMatrix'
export { useActivityFilter }       from './useActivityFilter'
export { useActivityActions }      from './useActivityActions'
export { useUserTrips }            from './useUserTrips'
export { useCreateTrip }           from './useCreateTrip'
