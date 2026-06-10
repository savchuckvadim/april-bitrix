export * from "./components";
export * from "./shared/";
// Both ./components (shadcn) and ./shared (RHF Controller wrapper) export `FormField`.
// Disambiguate the root export to the shadcn one (paired with FormItem/FormControl/
// useFormField). The shared wrapper remains available via `@workspace/ui/shared`.
export { FormField } from "./components";
