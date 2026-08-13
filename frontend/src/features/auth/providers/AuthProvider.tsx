"use client"

import { createContext, useEffect, useCallback, useState, useMemo } from 'react';
import { authService } from '../services/auth.service';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { ErrorUnauthorized } from '@/shared/lib/errorClasses';
import { ServiceStateType } from '@/shared/shared.types';
import { useRouter } from 'next/navigation';

type AuthContextType = {
	authId: string | null
	status: ServiceStateType<string | null>['status'];
	refetchStatus: () => void;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
	authId: null,
	status: 'idle',
	refetchStatus: () => {},
	logout: async () => {},
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {

	const router = useRouter();
	const [authId, setAuthId] = useState<string | null>(null);

	const authMutator = useServiceMutation(() => { 
		return authService.checkAuthStatus()
			.catch((error) => {
				if (error instanceof ErrorUnauthorized) { return null; }
				else { throw error; }
			});
	});

	useEffect(() => {
		authMutator.send(undefined);
	}, []);

	// protect children from accessing authMutator directly so flickers do not happen when auth is loading
	useEffect(() => {
		if (authMutator.status != 'ready') { return; }
		else { setAuthId(authMutator.data) }
	}, [authMutator.status])

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error(error);
		} finally {
			authMutator.overrideOutput(null);
			setAuthId(null);
			router.push('/');
			router.refresh();
		}
	}, []);

	const value = useMemo<AuthContextType>(
		() => ({ authId, status: authMutator.status, refetchStatus: () => { authMutator.send(undefined); }, logout }),
		[authId, authMutator.status, authMutator.send, logout]
	);

	return (
		<AuthContext.Provider value={ value  }>
			{children}
		</AuthContext.Provider>
	);
}