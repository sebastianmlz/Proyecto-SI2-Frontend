import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PaginatedChatSessions, PaginatedChatMessages, ChatSession, ChatMessage } from '../models/chat-session.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private baseUrl = environment.apiUrl + '/chatbot';

  constructor(private http: HttpClient) { }

  // Obtener todas las sesiones de chat del usuario
  getChatSessions(page: number = 1, pageSize: number = 10): Observable<PaginatedChatSessions> {
    const token = localStorage.getItem('access');
    if (!token) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<PaginatedChatSessions>(`${this.baseUrl}/sessions/`, { headers, params });
  }

  // Obtener mensajes de una sesión específica
  getChatMessages(sessionId: string, page: number = 1, pageSize: number = 50): Observable<PaginatedChatMessages> {
    const token = localStorage.getItem('access');
    if (!token) {
      console.error('❌ Intento de obtener mensajes sin token de autenticación');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    console.log(`🔍 Obteniendo mensajes para la sesión: ${sessionId}, página: ${page}, tamaño: ${pageSize}`);
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString())
      .set('session', sessionId);

    console.log(`📤 Enviando solicitud GET a ${this.baseUrl}/messages/ con parámetros:`, {
      session: sessionId,
      page: page,
      page_size: pageSize
    });
    
    return this.http.get<PaginatedChatMessages>(`${this.baseUrl}/messages/`, { headers, params })
      .pipe(
        tap(response => {
          console.log(`📥 Respuesta recibida para la sesión ${sessionId}:`, response);
        })
      );
  }

  // Enviar un mensaje al chatbot usando Fetch API para manejar streams exactamente como en chatbot.html
  sendMessage(message: string, sessionId?: string): Observable<string> {
    const token = localStorage.getItem('access');
    if (!token) {
      console.error('❌ Intento de enviar mensaje sin token de autenticación');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    console.log(`📤 Enviando mensaje "${message}" ${sessionId ? `para la sesión: ${sessionId}` : '(nueva sesión)'}`);

    // Crear un subject que emitirá el texto acumulado completo, no fragmentos
    const responseSubject = new Subject<string>();

    // Configurar los headers igual que en la guía
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    };

    // Preparar el body
    const body: any = {
      message,
      session_token: token
    };

    // Si se proporciona un ID de sesión, lo incluimos en la solicitud
    if (sessionId) {
      body.session_id = sessionId;
      console.log(`🔗 Enlazando mensaje a la sesión existente: ${sessionId}`);
    } else {
      console.log('🆕 Creando una nueva sesión para este mensaje');
    }
    
    console.log('📊 Datos completos de la solicitud:', body);

    // Usar fetch para manejar el stream exactamente como en chatbot.html
    fetch(`${this.baseUrl}/interaction/send_message/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // Usar reader para leer el stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      // Procesar el stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              // Procesar exactamente como en chatbot.html
              if (line.startsWith('data: ') && line.length > 6) {
                const content = line.substring(6);
                if (content.trim() && content !== 'true') {
                  // Acumular texto y enviar la actualización completa cada vez
                  accumulatedText += content;
                  // Asegurarse de que lo que emitimos es siempre un string
                  responseSubject.next(accumulatedText);
                }
              }
            }
          }
          
          // Completar el Subject cuando termina el stream
          responseSubject.complete();
        } catch (error) {
          console.error('Error procesando stream:', error);
          responseSubject.error(error);
        }
      };

      // Iniciar el procesamiento del stream
      processStream();
    })
    .catch(error => {
      console.error('Error en fetch:', error);
      responseSubject.error(error);
    });

    return responseSubject.asObservable();
  }
}