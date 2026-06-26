import ResetPasswordPage from "@/features/auth/components/RequestPasswordResetPage";

export default async function ResetPassword({ params }: { params: Promise<{ uniqueString: string }>; }) {
  const { uniqueString } = await params;
  return <ResetPasswordPage uniqueString={uniqueString} />;
}