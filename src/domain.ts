// prolly not the most fool proof way to do it but
// hey, it works for valid domains 

export function validDomain(domain: string): boolean {
  if (domain.length === 0 || domain.length > 253) return false;

  let labelLength = 0;
  let lastChar = '';
  let hasDot = false;

  for (const char of domain) {
    if (!/^[a-zA-Z0-9.-]$/.test(char)) return false;

    if (char === '.') {
      if (labelLength === 0 || lastChar === '-') return false;
      hasDot = true;
      labelLength = 0;
    } else {
      labelLength++;
      if (labelLength > 63) return false;
    }

    lastChar = char;
  }

  return hasDot && labelLength > 0 && lastChar !== '-';
}
