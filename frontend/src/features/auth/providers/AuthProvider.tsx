"use client"

import { createContext, useEffect, useCallback } from 'react';
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

	const logout = useCallback(async () => {
		await authService.logout()
			.then(() => { 
				authMutator.overrideOutput(null);
				router.push("/");
			})
			.catch((error) => console.error(error));
	}, [authMutator.overrideOutput]);

	return (
		<AuthContext.Provider value={ { 
			authId: (authMutator.status === 'ready') ? authMutator.data : null, 
			status: authMutator.status, 
			refetchStatus: () => { authMutator.send(undefined); },
			logout 
		} }>
			{children}
		</AuthContext.Provider>
	);
}