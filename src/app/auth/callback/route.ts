import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Sync user to public table
            const user = data.user;
            if (user) {
                // Check if user already exists
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id, role')
                    .eq('id', user.id)
                    .single();

                if (existingUser) {
                    // User exists - only update profile info, keep existing role
                    await supabase.from('users').update({
                        email: user.email,
                        full_name: user.user_metadata.full_name,
                        avatar_url: user.user_metadata.avatar_url,
                    }).eq('id', user.id);
                } else {
                    // New user - insert with default role
                    await supabase.from('users').insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata.full_name,
                        avatar_url: user.user_metadata.avatar_url,
                        role: 'user'
                    });
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
