import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";
import { verifySession } from "@/features/auth/server/session";
import { redirect } from "next/navigation";

export default async function ResetPassword({ params }: { params: Promise<{ token: string }>; }) {

	const [{ token }, session] = await Promise.all([
		params,
		verifySession
	]);
	
	if (session !== null) { redirect('/'); }

	return <ResetPasswordPage token={ token } />
}