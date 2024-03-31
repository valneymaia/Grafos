export function randInt(min: number, max: number) {
  min = Math.floor(min);
  max = Math.ceil(max);

  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randElementOfArray<T>(array: T[]): T {
  return array[randInt(0, array.length - 1)];
}

export function formatLongString(string: string, maxlength: number = 70): string[] {
  if(string.length >= maxlength) return [`${string}`];

  const words = string.split(" ");
  const formattedStrings: string[] = [];
  let line: string = "";
  let spaceCounts = 0;

  for (let i = 0, j = 1; i < words.length; i++, j++) {
    if(line.length + words[i].length + spaceCounts >= maxlength) {
      line = `${line} ${words[i]}`;
      spaceCounts++;
    } else {
      formattedStrings.push(`${line}`);
      spaceCounts = 0;
      line = "";
    }
  }

  return formattedStrings;
}

export function minmax(value: number, min: number, max: number): number {
  if (value < min) return min;
  else if (value > max) return max;
  else return value;
}
