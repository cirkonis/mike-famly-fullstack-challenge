# Exercises - Answers

## Exercise 1

This is a stale cache problem. The mutations (add, delete, activate) update the server correctly, but Apollo Client's cached query result doesn't know anything changed — so the UI stays stale until a full page refresh forces a fresh fetch.

Apollo's docs (https://www.apollographql.com/docs/react/data/queries#updating-cached-query-results) outline two approaches for updating cached query results: polling and refetching. Polling would continuously re-fetch on a timer, which doesn't make sense here since updates are driven by user actions, not background changes. Refetching is the right fit — we only need fresh data after a mutation the user just triggered.

Fixed by adding `refetchQueries` to all three `useMutation` hooks in `PaymentMethods.tsx` so that `GET_PAYMENT_METHODS` is re-fetched after each mutation. Also added `awaitRefetchQueries: true` so that the refetch completes before the UI updates — this way if there's any network latency, the user gets one clean update with fresh data rather than a brief flash of the stale state.

## Exercise 2

The delete operation was using the payment method's name (`method`) to identify which one to remove — all the way through the frontend, GraphQL schema, and backend. Since names aren't unique, deleting a "Visa" would delete every payment method called "Visa".

Added a failing test first to confirm the bug: create two payment methods with the same name, delete one by ID, and check the other survives. Then fixed the full stack to delete by `id` instead of `method` name — updated the domain logic, changed the GraphQL mutation argument from `method: String!` to `methodId: Long!`, simplified the resolver, and updated the frontend to pass the ID.

## Exercise 3

I tried to split this problem in two because I couldn't let go of the fact that there is nothing stopping a parent from deleting their only payment method so I added test and code changes for the following behaviour:

1. If it's the last remaining payment method, the deletion is blocked entirely (the parent needs to add a new one first before they can remove it).
2. If the deleted method was the active one and others remain, the first remaining method is automatically activated.

My initial though was alot of this could be "guarded" by UI code changes in the front end, disabling delete buttons and adding dialouges, but if these delete payment method calls get hit from other clients or directly it would still be possible to remove the only active payment still. Just noting here that I think some UI/UX should still be added but I wouldn't muddy this commit or branch in a real scenario, so I won't here either and just push the backend changes as a solution.

## Exercise 4

Added a `created_at` timestamp column to the `payment_methods` table via migration. Used `DEFAULT CURRENT_TIMESTAMP` so the database is the source of truth for when a payment method was created. Existing rows get the current time as their value.

Plumbed it through the full stack: the repository reads it back and formats it as an ISO string, the GraphQL schema exposes it as `createdAt`, and the frontend displays it alongside the active/inactive status as a formatted date.

One thing I noticed along the way: `parentProfileBackend.ts` has methods like `createPaymentMethod` that are only used by the test suite as data builders, and some methods that are used in resolvers as part of the apps flow. I had to update `createPaymentMethod` to include `createdAt` with a default value to keep the tests compiling, which felt like updating production code for test-only reasons. Coudl be moving these data builder functions is warranted or at least some indication in the file itself could be added so one knows when they are making changes on actual business logic.

## Exercise 5

Created a `payment_method_audit_log` table via migration to capture every change made to payment methods. Each entry records the parent, the payment method, what action was taken (CREATED, ACTIVATED, DELETED), a human-readable description of the change, who did it, and when.

The audit log writes are triggered in the resolvers — after each mutation (add, activate, delete) succeeds, it writes an entry to the audit table via the repository. The log is append-only by design, no update or delete operations are exposed.

I also exposed the audit log through GraphQL as a query so it's accessible through the same interface as everything else, rather than needing direct database access to review it.

A few thoughts on decisions I made and things I'd do differently with more time:

- **The "who" problem:** Right now there's no authentication in the app, so `performed_by` just stores the `parentId`. In a real app this would come from the authenticated session/token. I'd also denormalize and store a snapshot of the user's name alongside the ID — that way the audit log stays accurate even if the user changes their name or gets deleted (GDPR). The ID keeps traceability, the name snapshot keeps the log self-contained for compliance.

- **Storage:** I kept the audit log in the same MySQL database for simplicity, but in production I'd consider moving it to a separate store (something like Elasticsearch or BigQuery). Audit logs are append-only and high volume — they have different access patterns than operational data. The change would be straightforward since the repository pattern already separates data access from the resolvers, so you'd just swap in a different repository implementation without touching the resolver code.

- **No foreign key on `payment_method_id`:** This is intentional — we need to log deletions, and the payment method won't exist in the table anymore after a delete. A foreign key would either block the delete or cascade-remove the audit entry, both of which defeat the purpose.