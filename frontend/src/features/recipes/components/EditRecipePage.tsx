import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { Reorder } from 'framer-motion';
import useAuth from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/router';
import useNotebook from '@/shared/hooks/useNotebook';
import { RecipeType } from '../domain/recipes.types';
import { recipeService } from '../services/recipes.api';
import checkRecipeRequirements from '../domain/recipeRequirements';
import useTaggedList from '@/shared/hooks/useTaggedList';
import { ingredientService } from '@/features/ingredients/services/ingredient.api';
import { IngredientConversionType, IngredientType } from '../../ingredients/domain/ingredient.types';
import ImageUploader from '@/features/images/components/ImageUploader';
import { PackagedImageType } from '@/features/images/domain/image.types';

// This component will assume you are creating a brand new recipe if a recipeId isn't sent
interface EditRecipePageProps {
	recipeId?: string;
}
export default function EditRecipePage({recipeId}: EditRecipePageProps) {

	// define react hooks
	const router = useRouter();
	const { authUserId } = useAuth();

	const notebook = useNotebook();

	const [loadingError, setLoadingError] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	//define required useStates
	const [recipe, setRecipe] = useState<RecipeType>({_id: 'unsavedRecipe', title: '', description: '', ingredientList: [], instructionList: [], visibility: 'public'});

	// define some setters for sending to children components
	function setTitle(title: string) { setRecipe((oldRecipe) => ({ ...oldRecipe, title })); }
	function setDescription(description: string) { setRecipe((oldRecipe) => ({ ...oldRecipe, description })); }
	function setIngredientList(ingredientList: IngredientType[]) { setRecipe((previous) => ({ ...previous, ingredientList })); }
	function setInstructionList(instructions: string[]) { setRecipe((previous) => ({ ...previous, instructions })); }
	function setVisibility(visibility: 'public' | 'private' | 'personal') { setRecipe((oldRecipe) => ({ ...oldRecipe, visibility })); }

	// Define a space for image uploads
	const [imageBuffer, setImageBuffer] = useState<File | null>(null);

	//Startup useEffect statement
	useEffect (() => {
		// make sure current user is signed in, otherwise redirect to login
		if (!authUserId) { router.replace('/login'); }

		// if recipeId exists, populate the page with data from server for associated recipe
		if (recipeId) {
			recipeService.get(recipeId, { includeNutrients: false })
			.then ((returnObject) => {
				setRecipe(returnObject);
			})
			.catch((error) => {
				console.error(error);
				setLoadingError("Failed to load recipe. Please try again later.");
			});
		}
	},[recipeId]);

	//function for sending recipe changes to server
	function submitRecipe(){
		setErrorMessage("");

		const missingRecipeRequirements = checkRecipeRequirements(recipe);
		if (missingRecipeRequirements) { 
			setErrorMessage(missingRecipeRequirements);
			return;
		}

		//define what type of request is being sent to the server
		let method: string;
		if (!recipeId) method = 'post';
		else method = 'put';

		const formData = new FormData();

		if (recipe._id != 'unsavedRecipe') { formData.append("_id", recipe._id); }
		formData.append("title", recipe.title);
		formData.append("description", recipe.description);
		formData.append("ingredients", JSON.stringify(recipe.ingredientList));
		formData.append("instructions", JSON.stringify(recipe.instructionList));
		formData.append("visibility", recipe.visibility);
		if (imageBuffer instanceof File) { formData.append("image", imageBuffer); }

		if (recipeId) { recipeService.update(recipeId, {recipe: formData}) }
		else { recipeService.create({recipe: formData}) }
		//send request to the server
		recipeService.create({recipe: formData})
		.then(() => { router.push('/'); })
		.catch((error) => {
			console.error('Error submitting recipe:', error);
			setErrorMessage('Failed to submit recipe. Reason: ' + error.error || 'Unknown, Please try again later.');
		});
	}

	function deleteRecipe() {
		setErrorMessage("");

		// if recipeId doesn't exist, don't delete
		if (!recipeId) { 
			router.push('/');
			return;
		}

		recipeService.delete(recipeId)
		.then(() => {
			router.replace('/');
		})
		.catch((error) => {
			console.error('Error deleting recipe:', error);
			setErrorMessage('Failed to delete recipe. Please try again later.');
		});
	}

	function revertChanges() {
		window.location.reload();
	}

	// create pageList, a list of all function (plus associated variables) that are apart of the edit recipe page.
	const pageList = [
		<GeneralInfoPage
			newRecipe={!recipeId}
			title={recipe.title}
			setTitle={setTitle}
			description={recipe.description}
			setDescription={setDescription}
		/>,
		<AdditionalInfoPage
			imageBuffer={imageBuffer || undefined}
			setImageBuffer={setImageBuffer}
			oldImage={recipe.image || undefined}
			visibility={recipe.visibility}
			setVisibility={setVisibility}
		/>,
		<IngredientPage
			initialList={recipe.ingredientList} //! this might cause a loop, double check before deployment 
			setIngredientList={setIngredientList}
		/>,
		<InstructionPage
			initialList={recipe.instructionList} //! this might cause a loop, double check before deployment
			setInstructionList={setInstructionList}
		/>,
		<FinalizeChangesPage
			errorMessage={errorMessage}
			submitRecipe={submitRecipe}
			revertChanges={recipeId ? revertChanges : undefined}
			deleteRecipe={deleteRecipe}
		/>
	]

	if (loadingError) {
		return <div className="standardPage">
			<h1>Error</h1>
			<p>{loadingError}</p>
		</div>;
	}

	notebook.replaceComponentList(pageList)

	// call notebook and give it pageList
	return notebook.content;
}






//  ------------ GENERAL INFORMATION PAGE ------------

interface GeneralInfoPageProps {
	newRecipe: boolean;
	title: string;
	setTitle: (title: string) => void;
	description: string;
	setDescription: (description: string) => void;
}

function GeneralInfoPage ({newRecipe, title, setTitle, description, setDescription}: GeneralInfoPageProps) {
	return (
		<div className='consumeSpace'>
			<h1>{newRecipe ? 'New Recipe' : 'Edit Recipe'}</h1>

			<div className='textInput center extraBottom additionalMargin'>
			<label htmlFor='title'>Title</label>
			<input id='title' type='text' value={title} onChange={(event) => setTitle(event.target.value)} placeholder='give your recipe a title'/>
			</div>

			<div className='textInput center additionalMargin'>
			<label htmlFor='description'>Description</label>
			<textarea id='description' rows={9} value={description} onChange={(event) => setDescription(event.target.value)} placeholder='describe your recipe' />
			</div>
		</div>
	)
}






//  ------------ ADDITIONAL INFORMATION PAGE ------------
interface AdditionalInfoPageProps {
	imageBuffer?: File;
	setImageBuffer: React.Dispatch<React.SetStateAction<File | null>>;
	oldImage?: PackagedImageType;
	visibility: 'public' | 'private' | 'personal';
	setVisibility: (visibility: "public" | "private" | "personal") => void;
}

function AdditionalInfoPage ({imageBuffer, setImageBuffer, oldImage, visibility, setVisibility}: AdditionalInfoPageProps) {

	return (
		<div className='consumeSpace'>
			<h2>Additional Information</h2>

			<div style={{ width: '12rem', height: '12rem', margin: '0rem 0rem 3rem 3rem' }}>
				<ImageUploader 
					imageBuffer={imageBuffer} 
					setImageBuffer={setImageBuffer}
					oldImage={oldImage}
					category='recipe'
				/>
			</div>

			<div className='textInput center additionalMargin'>
				<div className='radioButtonInput'>
					<label>Recipe Visibility</label>
					<div className='radioOption'>
						<input type='radio' id='public' name='visibility' value='public' checked={visibility == 'public'} onChange={() => { setVisibility('public'); }}/>
						<label htmlFor='public'>Public - Anyone can view this recipe</label>
					</div>
					<div className='radioOption'>
						<input type='radio' id='private' name='visibility' value='private' checked={visibility == 'private'} onChange={() => { setVisibility('private'); }}/>
						<label htmlFor='private'>Private - You and friends can view this recipe</label>
					</div>
					<div className='radioOption'>
						<input type='radio' id='personal' name='visibility' value='personal' checked={visibility == 'personal'} onChange={() => { setVisibility('personal') }}/>
						<label htmlFor='personal'>Personal - Only you can view this recipe</label>
					</div>
				</div>
			</div>
		</div>
	)
}






// ------------ INGREDIENTS PAGE ------------

interface IngredientPageProps { 
	initialList: IngredientType[];
	setIngredientList: (ingredientList: IngredientType[]) => void;
}
function IngredientPage ({initialList, setIngredientList}: IngredientPageProps) {

	const taggedIngredientList = useTaggedList<IngredientType>();

	// updater useEffects, designed to keep the parent component in sync with this component
	useEffect(() => { taggedIngredientList.replaceList(initialList); }, [initialList]);
	useEffect(() => { setIngredientList(taggedIngredientList.untaggedContent) }, [taggedIngredientList.content]);

	const [newIngredient, setNewIngredient] = useState<IngredientType>({id:"", label:"", description:"", portion: { id:"", description:"", amount: null } });
	const [conversionFactorsAvailable, setConversionFactorsAvailable] = useState<IngredientConversionType[]>([{ id: '1489', description: 'g', conversionFactorValue: 1 }]);
	const [ingredientsAvailable, setIngredientsAvailable] = useState<IngredientType[]>([])

	function setNewIngredientDescription(newDescription: string) {
		setNewIngredient((previous: IngredientType) => { return { ...previous, foodId:'', foodDescription: newDescription }; });
		if (newDescription.length >= 3) { searchIngredients(newDescription); }
		else { setIngredientsAvailable([]); }
	}

	function searchIngredients(description: string) {
		ingredientService.search({description, limit: 12})
		.then((response) => { setIngredientsAvailable(response); })
		.catch((error) => { console.error(error); })
	}

	function selectIngredient (ingredient: IngredientType) {
		setNewIngredient((previous: IngredientType) => ({ ...previous, foodId: ingredient.id, foodDescription: ingredient.description }));
		ingredientService.conversionOptionList(ingredient.id)
		.then((response) => setConversionFactorsAvailable(response))
		.catch((error) => console.error(error));
		setIngredientsAvailable([]);
	}

	function addIngredient () {
		if (!newIngredient.id || !newIngredient.portion?.description || !newIngredient.portion?.amount) { return; }
		taggedIngredientList.appendItem(newIngredient);
		setNewIngredient({id: "", description: "", label:"", portion: { id: "", description: "", amount: null }});
	}

	return (
		<div className='consumeSpace'>
			<h2>Recipe Ingredients</h2>

			{/* ingredients list */}
			<Reorder.Group className='displayList' axis='y' values={taggedIngredientList.untaggedContent} onReorder={setIngredientList}>
				{taggedIngredientList.content.map((listItem, index) => (
					<Reorder.Item key={listItem.id} value={listItem} className='listItem'>
						<div className='options'>
							<FontAwesomeIcon 
								role='button'
								tabIndex={0}
								aria-label={`Remove ingredient ${index + 1}`}
								icon={faCircleXmark} 
								style={{color: "#575757",}} 
								onClick={() => taggedIngredientList.deleteItem(index)} 
							/>
						</div>
						{ listItem.item.label ? (
							<p>{listItem.item.label}</p>
						) : listItem.item.portion ? (
							<p>{listItem.item.portion.amount} {listItem.item.portion.description} of [{listItem.item.description}]</p>
						
						) : null }
					</Reorder.Item>
				))}
			</Reorder.Group>

			{/* add new ingredient section */}
			<div className='textInput shared additionalMargin'> 
				<label>New Ingredient</label>

				<input type='text' placeholder='Ingredient Label (optional)' value={newIngredient.label} onChange={(event) => setNewIngredient({...newIngredient, label: event.target.value})}/>

				<div className='inputs'>
					<input 
						type='number'  
						placeholder='Amount' 
						value={newIngredient.portion?.amount ?? ''} 
						onChange={(event) => setNewIngredient({...newIngredient, portion: { id: newIngredient.portion?.id || "", description: newIngredient.portion?.description || "", amount: event.target.value }})}
					/>
					<select 
						value={newIngredient.portion?.description} 
						onChange={(event) => setNewIngredient({...newIngredient, portion: { id: event.target.options[event.target.selectedIndex].id, description: event.target.value, amount: newIngredient.portion?.amount || null }})} 
					>
						<option value="" disabled hidden className='light'>Units</option>
						{conversionFactorsAvailable.map((conversionFactor, index) => (
						<option key={index} id={conversionFactor.id}>{conversionFactor.description}</option>
						))}
					</select>
					<div className='activeSearchBar'> {/* ingredient search bar */}
						<input type='text' className='mainInput' value={newIngredient.description} onChange={(event) => {setNewIngredientDescription(event.target.value)}} placeholder='Ingredient Description'/>
						<ul className={`${ingredientsAvailable.length == 0 ? 'hidden' : ''}`}>
						{ingredientsAvailable.map((ingredient, index) => (
								<li key={index} onClick={() => selectIngredient(ingredient)}> {ingredient.commonName ? ingredient.commonName : ingredient.description} </li>
						))}
						</ul>
					</div>
				</div>
			</div>
			<button className="darkText additionalMargin" onClick={() => addIngredient()}>Add Ingredient</button>

		</div>
	)
}






// ------------ INSTRUCTIONS PAGE ------------

interface InstructionPageProps {
	initialList: string[];
	setInstructionList: (instructionList: string[]) => void;
}

function InstructionPage ({initialList, setInstructionList}: InstructionPageProps) {

	const taggedInstructionList = useTaggedList<string>();
	useEffect(() => { taggedInstructionList.replaceList(initialList); }, [initialList]);
	useEffect(() => { setInstructionList(taggedInstructionList.untaggedContent); }, [taggedInstructionList.untaggedContent]);

	const [newInstruction, setNewInstruction] = useState('');

	function addInstruction() {
		if(newInstruction.length < 3) { return; }
		taggedInstructionList.appendItem(newInstruction);
		setNewInstruction('');
	}

	return (
		<div className='consumeSpace'>
			<h2>Recipe Instructions</h2>
			<Reorder.Group className='displayList' axis='y' values={taggedInstructionList.untaggedContent} onReorder={setInstructionList}>
				{taggedInstructionList.content.map((listItem, index) => (
					<Reorder.Item key={listItem.id} value={listItem} className='listItem'>
						<div className='contents'>
							<h4>Step {index + 1} </h4>
							<p>{listItem.item}</p>
						</div>
							<div className='options'>
							<FontAwesomeIcon 
								role='button'
								tabIndex={0}
								aria-label={`Remove instruction ${index + 1}`}
								icon={faTrash} 
								style={{color: "#575757",}} 
								onClick={() => { taggedInstructionList.deleteItem(index) }} 
							/>
						</div>
					</Reorder.Item>
				))}
			</Reorder.Group>

			<div className='textInput additionalMargin'>
				<label htmlFor='newInstruction'>New Instruction</label>
				<textarea id="newInstruction" rows={6} value={newInstruction} onChange={(event) => {setNewInstruction(event.target.value)}} placeholder='add a new instruction'/>
			</div>
			<button onClick={() => { addInstruction(); }}>Add Instruction</button>
		</div>
	)
}






//  ------------ FINALIZE CHANGES PAGE ------------

interface FinalizeChangesPageProps {
	errorMessage: string;
  	submitRecipe: () => void;
	revertChanges?: () => void;
	deleteRecipe: () => void;
}

function FinalizeChangesPage({errorMessage, submitRecipe, deleteRecipe, revertChanges}: FinalizeChangesPageProps) {

	const [revertChangesConfirmation, setRevertConfirmation] = useState<boolean>(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

	function attemptRevertChanges() {
		if (!revertChangesConfirmation) {
			setRevertConfirmation(true);
			return;
		}

		// Call the revertChanges function if it exists
		if (revertChanges) { revertChanges(); } 
	}

	function attemptDeleteRecipe() {
		if (!deleteConfirmation) {
			setDeleteConfirmation(true);
			return;
		}

		deleteRecipe();
	}

	return (
		<div className='consumeSpace'>
			<h2>Finalize Recipe Changes</h2>
			<button className="darkText additionalMargin" onClick={() => submitRecipe()}>Save recipe</button>
			<p className={errorMessage ? "error" : "hidden"} aria-live="assertive">{errorMessage}</p>
			{ revertChanges ? (
				<div className='devisableButton additionalMargin'>
					<button onClick={() => attemptRevertChanges()}>{!revertChangesConfirmation ? "Revert Changes" : "Confirm Revert"}</button>
					<button className={revertChangesConfirmation ? 'showButton' : 'hideButton'} onClick={() => setRevertConfirmation(false)}>Cancel</button>
				</div>
			) : null}
			<div className='devisableButton additionalMargin'>
				<button onClick={() => attemptDeleteRecipe()}>{!deleteConfirmation? "Delete Recipe" : "Confirm Delete"}</button>
				<button className={deleteConfirmation ? 'showButton' : 'hideButton'} onClick={() => { setDeleteConfirmation(false); }}>Cancel</button>
			</div>
		</div>
	)
}