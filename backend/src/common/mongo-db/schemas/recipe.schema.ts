import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { ImageSchema } from './image.schema';

const portionSchema = new Schema({
    measure_id: { type: Number, required: true },
    amount: { type: Number, required: true },
});

const ingredientSchema = new Schema({
    food_id: { type: Number, required: true },
    label: { type: String, allowNull: false },
    portion: { type: portionSchema, required: true }
});

const nutritionSchema = new Schema({
    calories: { type: Number, required: true },
    fat: { type: Number, required: true },
    cholesterol: { type: Number, required: true },
    sodium: { type: Number, required: true },
    potassium: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fibre: { type: Number, required: true },
    sugar: { type: Number, required: true },
    protein: { type: Number, required: true },
});

const recipeSchema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: String,
    image: { type: ImageSchema, default: null },
    ingredientList: [ingredientSchema],
    instructionList: [String],
    nutrition: { type: nutritionSchema, required: true },
    visibility: {type: String, enum: ['public', 'private', 'personal'], default: 'public'},
}, { timestamps: true });

type IngredientSchemaType = InferSchemaType<typeof ingredientSchema>;
export type IngredientRecord = IngredientSchemaType;

type RecipeSchemaType = InferSchemaType<typeof recipeSchema>;
export type RecipeDocument = HydratedDocument<RecipeSchemaType>;
export type RecipeRecord = RecipeSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const RecipeModel = model('Recipe', recipeSchema);