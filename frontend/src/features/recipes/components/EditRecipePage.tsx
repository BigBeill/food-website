import { useRef } from 'react';
import useAuth from '@/features/auth/hooks/useAuth';
import { RecipeDraft, RecipeType } from '../domain/recipes.types';
import { recipeService } from '../services/recipes.service';
import EditRecipeGeneralInfoPage from './EditRecipeSubPages/GeneralInfoPage';
import EditRecipeAdditionalInfoPage from './EditRecipeSubPages/AdditionalInfoPage';
import EditRecipeIngredientsPage from './EditRecipeSubPages/IngredientsPage';
import EditRecipeInstructionsPage from './EditRecipeSubPages/InstructionsPage';
import EditRecipeFinalizeChangesPage from './EditRecipeSubPages/FinalizeChangesPage';
import useServiceState from '@/shared/hooks/useServiceState';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { DataHandle } from '@/shared/shared.types';
import { useRouter } from 'next/navigation';
import RequireServiceStateReady from '@/shared/components/RequireServiceStateReady';
import Notebook from '@/shared/components/Notebook';

// if no recipeId has been assigned this page will assume you are creating a brand new recipe
export default function EditRecipePage({ recipeId }: { recipeId?: string }) {
	const { authId } = useAuth();

	const defaultRecipe: RecipeDraft = {
		ownerId: authId!,
		title: '', 
		description: '', 
		ingredientList: [], 
		instructionList: [], 
		visibility: 'public',
	}

	// fetch recipe from the server on recipeId change
	const recipeState = useServiceState(() => { 
		if (recipeId) { return recipeService.get(recipeId); }
		else { return Promise.resolve(defaultRecipe); }
	}, [recipeId]);

	return (
		<RequireServiceStateReady serviceState={ recipeState }>
			{(recipe) => <EditRecipeView recipe={ recipe } />}
		</RequireServiceStateReady>
	);
}

function EditRecipeView({ recipe }: { recipe: RecipeType | RecipeDraft }) {

	const router = useRouter();
	const { authId } = useAuth();

	// page references
	const generalInfoPageRef = useRef<DataHandle<{ title: string, description: string }>>(null);
	const additionalInfoPageRef = useRef<DataHandle<{ imageBuffer?: File, visibility: 'public' | 'private' | 'personal' }>>(null);
	const ingredientPageRef = useRef<DataHandle<IngredientType[]>>(null);
	const instructionPageRef = useRef<DataHandle<string[]>>(null);

	const saveRecipeMutator = useServiceMutation((): Promise<void> => {
		const input = collectRecipeData();
		if ('_id' in input) { return recipeService.update(input as RecipeType, additionalInfoPageRef.current!.getData().imageBuffer); }
		else { return recipeService.create(input, additionalInfoPageRef.current!.getData().imageBuffer); }
	});

	const deleteRecipeMutator = useServiceMutation(async () => {
		if ( '_id' in recipe ) {
			const deleteResult = await recipeService.delete(recipe._id); 
			router.push("/");
			return deleteResult;
		}
	})

	function collectRecipeData(): RecipeDraft | RecipeType {
		return {
			...("_id" in recipe && { _id: recipe._id }),
			ownerId: authId!,
			...generalInfoPageRef.current!.getData(),
			visibility: additionalInfoPageRef.current!.getData().visibility,
			ingredientList: ingredientPageRef.current!.getData(),
			instructionList: instructionPageRef.current!.getData(),
		}	
	}

	// call notebook and give it pageList
	return (
		<Notebook childrenCount={ 5 }>
			<EditRecipeGeneralInfoPage newRecipe={ !('_id' in recipe) } ref={ generalInfoPageRef } initial={ { title: recipe.title, description: recipe.description } } />,
			<EditRecipeAdditionalInfoPage oldImage={ ('_id' in recipe) ? recipe.image : undefined } ref={ additionalInfoPageRef } initial={ { visibility: recipe.visibility } } />,
			<EditRecipeIngredientsPage ref={ ingredientPageRef } initial={ recipe.ingredientList } />,
			<EditRecipeInstructionsPage ref={ instructionPageRef } initial={ recipe.instructionList } />,
			<EditRecipeFinalizeChangesPage saveRecipeMutator={ saveRecipeMutator } deleteRecipeMutator={ deleteRecipeMutator } />
		</Notebook>
	)
}