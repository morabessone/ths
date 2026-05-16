export function getSpanishErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message);
    if (msg.includes('Invalid login credentials')) {
      return 'Email o contraseña incorrectos.';
    }
    if (msg.includes('User already registered')) {
      return 'Ya existe una cuenta con este email.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Confirmá tu email antes de iniciar sesión.';
    }
    return msg;
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
