// O'zbekcha kirill -> lotin almashtiruvchi (qidiruvda kirill bilan yozganlarga ham
// mahsulot topilishi uchun). Rasmiy o'zbek lotin alifbosiga asoslangan.
const CYR_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "'", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
};

export function isCyrillic(text: string): boolean {
  return /[а-яёўқғҳ]/i.test(text);
}

export function cyrillicToLatinUz(text: string): string {
  return text
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      const mapped = CYR_TO_LAT[lower];
      if (mapped === undefined) return ch;
      // Katta harfni saqlab qolish (birinchi harfini bosh harf qilish)
      if (ch !== lower && mapped.length > 0) {
        return mapped.charAt(0).toUpperCase() + mapped.slice(1);
      }
      return mapped;
    })
    .join("");
}
