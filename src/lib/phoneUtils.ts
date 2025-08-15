/**
 * Utilitários para manipulação de números de telefone
 */

/**
 * Remove a máscara do telefone, deixando apenas os números
 * @param phone - Número de telefone com ou sem máscara
 * @returns Número de telefone apenas com dígitos
 * 
 * Exemplos:
 * - "(11) 99999-9999" -> "11999999999"
 * - "+55 11 99999-9999" -> "5511999999999"
 * - "11 99999-9999" -> "11999999999"
 * - "11999999999" -> "11999999999"
 */
export function removePhoneMask(phone: string): string {
  if (!phone) return '';
  
  // Remove todos os caracteres que não são dígitos
  return phone.replace(/\D/g, '');
}

/**
 * Formata um número de telefone para exibição
 * @param phone - Número de telefone apenas com dígitos
 * @returns Número formatado para exibição
 * 
 * Exemplos:
 * - "11999999999" -> "(11) 99999-9999"
 * - "5511999999999" -> "+55 (11) 99999-9999"
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  const cleanPhone = removePhoneMask(phone);
  
  // Telefone com código do país (13 dígitos: +55 11 99999-9999)
  if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
    const countryCode = cleanPhone.slice(0, 2);
    const areaCode = cleanPhone.slice(2, 4);
    const firstPart = cleanPhone.slice(4, 9);
    const secondPart = cleanPhone.slice(9, 13);
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  }
  
  // Telefone nacional (11 dígitos: 11 99999-9999)
  if (cleanPhone.length === 11) {
    const areaCode = cleanPhone.slice(0, 2);
    const firstPart = cleanPhone.slice(2, 7);
    const secondPart = cleanPhone.slice(7, 11);
    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }
  
  // Telefone com 10 dígitos (formato antigo: 11 9999-9999)
  if (cleanPhone.length === 10) {
    const areaCode = cleanPhone.slice(0, 2);
    const firstPart = cleanPhone.slice(2, 6);
    const secondPart = cleanPhone.slice(6, 10);
    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }
  
  // Retorna o número original se não conseguir formatar
  return phone;
}

/**
 * Valida se um número de telefone está em formato válido
 * @param phone - Número de telefone para validar
 * @returns true se o telefone é válido
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  
  const cleanPhone = removePhoneMask(phone);
  
  // Aceita telefones com 10, 11 ou 13 dígitos
  // 10: formato antigo (11 9999-9999)
  // 11: formato atual (11 99999-9999)
  // 13: com código do país (+55 11 99999-9999)
  return /^\d{10,13}$/.test(cleanPhone);
}