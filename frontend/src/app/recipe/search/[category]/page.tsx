import SearchRecipePage from "@/features/recipes/components/SearchRecipePage";

export default async function SearchRecipe({category}: {category: "public" | "friends" | "personal"}) {
   return <SearchRecipePage category={category} />;
}