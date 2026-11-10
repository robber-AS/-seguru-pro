export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Lê uma data do banco. "2026-11-25" (coluna date) vira meia-noite LOCAL;
 * new Date("2026-11-25") seria meia-noite UTC = dia anterior no Brasil.
 */
export function parseDate(date: string | null | undefined): Date {
  if (!date) return new Date(NaN);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(date);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  const d = parseDate(date);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
}

/** "2.500,00" | "2500,5" | "375.00" | "R$ 1.234,56" -> "2500.00" (ponto decimal). Vazio -> null. */
export function toDecimal(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return isNaN(value) ? null : value.toFixed(2);
  let s = value.replace(/[^\d.,-]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n.toFixed(2);
}

/** Exibe um valor decimal do banco ("375.00") no formato dos campos do formulário ("375,00"). */
export function toInputDecimal(value: string | number | null | undefined): string {
  const d = toDecimal(value as any);
  return d ? d.replace(".", ",") : "";
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR");
}

export function formatCPF(value: string): string {
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(value: string): string {
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(value: string): string {
  return value.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
}

export function formatPlate(value: string): string {
  return value.replace(/([a-zA-Z]{3})(\d{4})/, "$1-$2");
}

export function maskCPF(value: string): string {
  const v = value.replace(/\D/g, "");
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function maskPhone(value: string): string {
  const v = value.replace(/\D/g, "");
  return v.replace(/(\d{2})(\d{0,5})(\d{0,4})/, "($1) $2-$3").trim();
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Converte strings vazias em null (o Postgres recusa "" em colunas uuid, date e integer). */
export function cleanPayload<T extends Record<string, any>>(values: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = typeof v === "string" && v.trim() === "" ? null : v;
  }
  return out as T;
}

/** Busca sem diferenciar maiúsculas/acentos em vários campos (usada quando a busca envolve tabelas relacionadas). */
export function textMatch(search: string, ...values: (string | null | undefined)[]): boolean {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = norm(search.trim());
  if (!q) return true;
  return values.some((v) => v != null && norm(String(v)).includes(q));
}

/** Escapa caracteres que quebram o filtro .or() do PostgREST. */
export function orSafe(value: string): string {
  return value.replace(/[,()]/g, " ").trim();
}

/** Retorna os rótulos dos campos obrigatórios que estão vazios. */
export function missingFields(values: Record<string, any>, required: Record<string, string>): string[] {
  return Object.entries(required)
    .filter(([k]) => values[k] === null || values[k] === undefined || String(values[k]).trim() === "")
    .map(([, label]) => label);
}

export function maskCNPJ(value: string): string {
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateCPF(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i), 10) * (10 - i);
  let check = 11 - (sum % 11);
  if (check > 9) check = 0;
  if (check !== parseInt(digits.charAt(9), 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i), 10) * (11 - i);
  check = 11 - (sum % 11);
  if (check > 9) check = 0;
  return check === parseInt(digits.charAt(10), 10);
}

export function validateCNPJ(cnpj: string): boolean {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  let length = digits.length - 2;
  let numbers = digits.substring(0, length);
  const digits2 = digits.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits2.charAt(0), 10)) return false;
  length++;
  numbers = digits.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits2.charAt(1), 10);
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
