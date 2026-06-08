# Exercises - Answers

## Exercise 1

This is a stale cache problem. The mutations (add, delete, activate) update the server correctly, but Apollo Client's cached query result doesn't know anything changed — so the UI stays stale until a full page refresh forces a fresh fetch.

Apollo's docs (https://www.apollographql.com/docs/react/data/queries#updating-cached-query-results) outline two approaches for updating cached query results: polling and refetching. Polling would continuously re-fetch on a timer, which doesn't make sense here since updates are driven by user actions, not background changes. Refetching is the right fit — we only need fresh data after a mutation the user just triggered.

Fixed by adding `refetchQueries` to all three `useMutation` hooks in `PaymentMethods.tsx` so that `GET_PAYMENT_METHODS` is re-fetched after each mutation. Also added `awaitRefetchQueries: true` so that the refetch completes before the UI updates — this way if there's any network latency, the user gets one clean update with fresh data rather than a brief flash of the stale state.

## Exercise 2

The delete operation was using the payment method's name (`method`) to identify which one to remove — all the way through the frontend, GraphQL schema, and backend. Since names aren't unique, deleting a "Visa" would delete every payment method called "Visa".

Added a failing test first to confirm the bug: create two payment methods with the same name, delete one by ID, and check the other survives. Then fixed the full stack to delete by `id` instead of `method` name — updated the domain logic, changed the GraphQL mutation argument from `method: String!` to `methodId: Long!`, simplified the resolver, and updated the frontend to pass the ID.
