import { Inngest } from "inngest";
import User from "../models/User.js";
import { createUserFromClerk, deleteUserData } from "../utils/users.js";

// The app id is intentionally unchanged from before the rebrand so an existing Inngest
// deployment keeps working without re-registering the app.
export const inngest = new Inngest({
    id: "pingup-app",
    signingKey: process.env.INNGEST_SIGNING_KEY,
});

const primaryEmail = (data) =>
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id)?.email_address ||
    data.email_addresses?.[0]?.email_address ||
    "";

// Clerk -> Inngest -> here: create the Linkly profile as soon as someone signs up.
// (The API also creates it on first request, so this is an optimisation, not a requirement.)
const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const data = event.data;
        if (await User.exists({ _id: data.id })) return { skipped: true };

        await createUserFromClerk({
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            username: data.username,
            email: primaryEmail(data),
            imageUrl: data.image_url,
        });
        return { created: true };
    }
);

// Only the email is kept in sync. Name, username, bio and pictures belong to Linkly once the
// profile exists, so edits made inside the app are never overwritten by Clerk.
const syncUserUpdate = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        await User.updateOne({ _id: event.data.id }, { $set: { email: primaryEmail(event.data) } });
    }
);

// Account deleted in Clerk: remove the profile and everything attached to it.
const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        if (event.data.id) await deleteUserData(event.data.id);
    }
);

export const functions = [syncUserCreation, syncUserUpdate, syncUserDeletion];
