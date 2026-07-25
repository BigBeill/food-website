import { useEffect, useRef } from 'react';
import useAuth from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/router';
import useNotebook from '@/shared/hooks/useNotebook';
import { RecipeDraft, RecipeType } from '../domain/recipes.types';
import { recipeService } from '../services/recipes.service';
import EditRecipeGeneralInfoPage from './EditRecipeSubPages/GeneralInfoPage';
import EditRecipeAdditionalInfoPage from './EditRecipeSubPages/AdditionalInfoPage';
import EditRecipeIngredientsPage from './EditRecipeSubPages/IngredientsPage';
import EditRecipeInstructionsPage from './EditRecipeSubPages/InstructionsPage';
import EditRecipeFinalizeChangesPage from './EditRecipeSubPages/FinalizeChangesPage';
import LoadingPage from '@/shared/components/stateComponents/LoadingPage';
import useServiceState from '@/shared/lib/serviceState';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { ChildFormContent } from '@/shared/shared.types';
import { useServiceMutation } from '@/shared/lib/serviceMutation';
import ErrorPage from '@/shared/components/stateComponents/ErrorPage';

// if no recipeId has been assigned this page will assume you are creating a brand new recipe
export default function EditRecipePage({ recipeId }: { recipeId?: string }) {

	const router = useRouter();
	const { authId, loading: authLoading } = useAuth();
	const notebook = useNotebook();

	const defaultRecipe: RecipeType = {
		_id: 'unsavedRecipe', 
		ownerId: authId!, //? this page will be redirected if the user is not signed in
		title: '', 
		description: '', 
		ingredientList: [], 
		instructionList: [], 
		visibility: 'public',
	}

	// make sure user is signed in before letting them edit recipes
	if (authLoading) { return <LoadingPage /> }
	if (!authId) router.replace('/login');

	// page references
	const generalInfoPageRef = useRef<ChildFormContent<{ title: string, description: string }>>(null);
	const additionalInfoPageRef = useRef<ChildFormContent<{ imageBuffer?: File, visibility: 'public' | 'private' | 'personal' }>>(null);
	const ingredientPageRef = useRef<ChildFormContent<IngredientType[]>>(null);
	const instructionPageRef = useRef<ChildFormContent<string[]>>(null);

	// fetch recipe from the server on recipeId change
	const recipeServiceState = useServiceState(() => { 
		if (recipeId) { return recipeService.get(recipeId); }
		else { return Promise.resolve(defaultRecipe); }
	}, [recipeId]);
	
	// update the child forms
	useEffect(() => { 
		if (recipeServiceState.status === 'ready') { 
			const fetchedRecipe = recipeServiceState.data;
			generalInfoPageRef.current?.setContent!({ title: fetchedRecipe.title, description: fetchedRecipe.description });
			additionalInfoPageRef.current?.setContent!({ visibility: fetchedRecipe.visibility });
			ingredientPageRef.current?.setContent!(fetchedRecipe.ingredientList);
			instructionPageRef.current?.setContent!(fetchedRecipe.instructionList);
		} 
	}, [recipeServiceState.status]);

	const saveRecipeMutator = useServiceMutation((): Promise<void> => {
		const input = collectRecipeData();
		if (!recipeId) { return recipeService.create(input as RecipeDraft, additionalInfoPageRef.current!.getContent().imageBuffer); }
		else { return recipeService.update(input as RecipeType, additionalInfoPageRef.current!.getContent().imageBuffer); }
	});

	const deleteRecipeMutator = useServiceMutation(async () => {
		if(!recipeId) { return; }
		else { 
			const deleteResult = await recipeService.delete(recipeId); 
			router.push("/");
			return deleteResult;
		}
	})

	function collectRecipeData(): RecipeDraft | RecipeType {
		return {
			...(recipeId && { _id: recipeId }),
			ownerId: authId!,
			...generalInfoPageRef.current!.getContent(),
			visibility: additionalInfoPageRef.current!.getContent().visibility,
			ingredientList: ingredientPageRef.current!.getContent(),
			instructionList: instructionPageRef.current!.getContent(),
		}	
	}

	if (recipeServiceState.status == 'loading') { return <LoadingPage /> }
	if (recipeServiceState.status != 'ready') { return <ErrorPage /> }

	// create pageList, a list of all function (plus associated variables) that are apart of the edit recipe page.
	const pageList = [
		<EditRecipeGeneralInfoPage newRecipe={ !recipeId } ref={ generalInfoPageRef } />,
		<EditRecipeAdditionalInfoPage oldImage={ recipeServiceState.data.image || undefined } ref={ additionalInfoPageRef } />,
		<EditRecipeIngredientsPage ref={ ingredientPageRef } />,
		<EditRecipeInstructionsPage ref={ instructionPageRef } />,
		<EditRecipeFinalizeChangesPage saveRecipeMutator={ saveRecipeMutator } deleteRecipeMutator={ deleteRecipeMutator } />
	]

	notebook.replaceComponentList(pageList)

	// call notebook and give it pageList
	return notebook.content;
}