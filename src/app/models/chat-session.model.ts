export interface ChatSession {
  id: number;  // Cambiado de string a number según la respuesta
  session_token: string;
  created_at: string;
  updated_at: string;
  user: number;  // Agregado
  active: boolean;  // Agregado
}

// El formato de respuesta paginada es diferente
export interface PaginatedChatSessions {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: ChatSession[];  // items en lugar de results
}

// También actualizar ChatMessage para que coincida con la respuesta
export interface ChatMessage {
  id: number;  // Cambiado de string a number
  session: number;  // Cambiado de string a number
  sender: 'user' | 'bot';
  message: string;  // Cambiado de 'content' a 'message' según la respuesta
  created_at: string;
}

// Actualizar la interfaz PaginatedChatMessages para que coincida con la respuesta real
export interface PaginatedChatMessages {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: ChatMessage[];  // Cambiado de 'results' a 'items' para coincidir con el API
}