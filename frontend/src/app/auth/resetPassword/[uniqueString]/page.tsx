"use client"

import RequireNoAuth from "@/features/auth/components/RequireNoAuth";
import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";

export default async function ResetPassword({ params }: { params: Promise<{ token: string }>; }) {
	const { token } = await params;
	return (
		<RequireNoAuth>
			<ResetPasswordPage token={ token } />
		</RequireNoAuth>
	);
}