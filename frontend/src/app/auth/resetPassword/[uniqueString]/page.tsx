"use client"

import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";

export default async function ResetPassword({ params }: { params: Promise<{ token: string }>; }) {
  const { token } = await params;
  return <ResetPasswordPage token={ token } />;
}