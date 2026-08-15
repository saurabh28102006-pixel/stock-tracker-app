'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName }, headers: await headers() })

        if(response) {
            try {
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                })
            } catch (inngestErr) {
                console.error('Inngest user.created event failed:', inngestErr);
            }
        }

        return { success: true, data: response }
    } catch (e: unknown) {
        console.error('Sign up failed', e)
        const errorMsg = e instanceof Error ? e.message : 'Sign up failed';
        return { success: false, error: errorMsg }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password }, headers: await headers() })

        return { success: true, data: response }
    } catch (e: unknown) {
        console.error('Sign in failed', e)
        const errorMsg = e instanceof Error ? e.message : 'Sign in failed';
        return { success: false, error: errorMsg }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e: unknown) {
        console.error('Sign out failed', e)
        const errorMsg = e instanceof Error ? e.message : 'Sign out failed';
        return { success: false, error: errorMsg }
    }
}
