import { DataHandle } from "@/shared/shared.types";
import { Ref, useImperativeHandle, useState } from "react";

interface EditRecipeGeneralInfoPageProps {
	newRecipe: boolean;
	ref: Ref<DataHandle<{ title: string, description: string }>>;
	initial?: { title: string, description: string};
}

export default function EditRecipeGeneralInfoPage ({ newRecipe, ref, initial }: EditRecipeGeneralInfoPageProps) {
	const [title, setTitle] = useState<string>(initial?.title || '');
	const [description, setDescription] = useState<string>(initial?.description || '')

	useImperativeHandle(ref, () => ({
		getData: () => { return { title, description } },
		setData: ({ title, description }) => {
			setTitle(title);
			setDescription(description);
		}
	}), [title, description]);

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
