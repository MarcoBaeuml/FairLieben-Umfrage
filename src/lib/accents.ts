/** Farbwelt je Zielgruppe, in der Reihenfolge aus fragen.md. Klassen ausgeschrieben, damit Tailwind sie findet. */
export const ACCENTS = [
	{
		gradient: 'from-rose-500 to-orange-400',
		text: 'text-rose-500',
		focus: 'focus-within:ring-rose-300 focus-within:shadow-rose-200/60',
		soft: 'bg-rose-50 text-rose-600',
		icon: 'group-focus-within:text-rose-400'
	},
	{
		gradient: 'from-sky-500 to-indigo-500',
		text: 'text-sky-500',
		focus: 'focus-within:ring-sky-300 focus-within:shadow-sky-200/60',
		soft: 'bg-sky-50 text-sky-600',
		icon: 'group-focus-within:text-sky-400'
	}
];

export function accentFor(index: number) {
	return ACCENTS[index % ACCENTS.length];
}
