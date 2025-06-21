import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar'; // Para panel de historial
import { DividerModule } from 'primeng/divider'; // Para separadores en el historial
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatbotService } from '../../services/chatbot.service';
import { AuthService } from '../../services/auth.service';
import { marked } from 'marked';
import { ChatSession, ChatMessage } from '../../models/chat-session.model';


interface LocalChatMessage {
  content: string | SafeHtml;
  sender: 'user' | 'bot' | 'system';
  timestamp?: Date;
  id?: string;
  element?: HTMLElement;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    RippleModule,
    AvatarModule,
    SidebarModule,
    DividerModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  isHistoryShown = false;
  messages: LocalChatMessage[] = [];
  messageInput = '';
  isTyping = false;
  isLoggedIn = false;
  
  // Nuevas propiedades para el historial de chat
  chatSessions: ChatSession[] = [];
  currentSessionId: string | null = null;
  loadingHistory = false;
  currentPage = 1;
  totalSessions = 0;
  
  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    // Inicializar variables para evitar errores de undefined
    this.chatSessions = [];
    this.totalSessions = 0;
    
    if (!this.isLoggedIn) {
      this.addSystemMessage('Debes iniciar sesión para usar el chatbot');
    } else {
      // Solo intentar cargar sesiones si el usuario está logueado
      this.loadChatSessions();
    }
  }
  
  toggleChat(): void {
    if (!this.isOpen && this.isLoggedIn) {
      if (this.messages.length === 0 && !this.currentSessionId) {
        this.addMessage('**¡Bienvenido!** al chatbot de FICCT E-commerce. ¿En qué puedo ayudarte?', 'bot');
      }
    }
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 300);
    }
  }
  
  toggleHistory(): void {
    this.isHistoryShown = !this.isHistoryShown;
    
    // Si abrimos el historial y no hay sesiones cargadas, las cargamos
    if (this.isHistoryShown && this.chatSessions.length === 0) {
      this.loadChatSessions();
    }
  }
  
  // Método para cargar las sesiones de chat
  loadChatSessions(page: number = 1): void {
    if (!this.isLoggedIn) return;
    
    this.loadingHistory = true;
    this.currentPage = page;
    
    this.chatbotService.getChatSessions(page).subscribe({
      next: (response) => {
        // Adaptamos el nuevo formato de respuesta
        if (response && Array.isArray(response.items)) {
          this.chatSessions = response.items;
          this.totalSessions = response.total || 0;
        } else {
          console.error('Formato de respuesta inesperado:', response);
          this.chatSessions = [];
          this.totalSessions = 0;
        }
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Error al cargar sesiones de chat:', error);
        this.chatSessions = [];
        this.totalSessions = 0;
        this.loadingHistory = false;
        this.addSystemMessage('Error al cargar el historial de conversaciones.');
      }
    });
  }
  
  // Método para cargar una sesión específica
  loadChatSession(sessionId: string | number): void {
    if (!this.isLoggedIn || sessionId === undefined) return;
    
    // Convertir a string para asegurar compatibilidad
    const sessionIdStr = sessionId.toString();
    
    console.log('🔍 Cargando sesión:', sessionIdStr);
    
    this.clearMessages();
    this.addSystemMessage('Cargando conversación...');
    
    this.currentSessionId = sessionIdStr;
    this.isHistoryShown = false;
    
    this.chatbotService.getChatMessages(sessionIdStr).subscribe({
      next: (response) => {
        console.log('📥 Respuesta recibida para sesión', sessionIdStr, ':', response);
        
        this.clearMessages();
        
        if (response && Array.isArray(response.items)) {
          console.log(`✅ Se encontraron ${response.items.length} mensajes para la sesión ${sessionIdStr}`);
          
          if (response.items.length > 0) {
            // Ordenar cronológicamente
            const sortedMessages = [...response.items].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            console.log('📋 Mostrando mensajes en orden cronológico:', sortedMessages);
            
            // Añadir los mensajes al chat - IMPORTANTE: usar message en vez de content
            sortedMessages.forEach(msg => {
              this.addMessage(msg.message, msg.sender as 'user' | 'bot');
            });
          } else {
            this.addSystemMessage('No hay mensajes en esta conversación.');
          }
        } else {
          console.error('❌ Formato de respuesta inesperado:', response);
          this.addSystemMessage('Error al procesar los mensajes de la conversación.');
        }
        
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('❌ Error al cargar mensajes:', error);
        this.clearMessages();
        this.addSystemMessage('Error al cargar los mensajes de la conversación.');
      }
    });
  }
  
  // Método para limpiar todos los mensajes
  clearMessages(): void {
    this.messages = [];
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  }
  
  // Iniciar una nueva conversación
  startNewConversation(): void {
    this.currentSessionId = null;
    this.clearMessages();
    this.addMessage('**¡Bienvenido!** al chatbot de FICCT E-commerce. ¿En qué puedo ayudarte?', 'bot');
    this.isHistoryShown = false;
  }

  sendMessage(): void {
    if (!this.messageInput.trim() || !this.isLoggedIn) return;
    
    const userMessage = this.messageInput;
    this.addMessage(userMessage, 'user');
    this.messageInput = '';
    this.isTyping = true;
    
    // Crear un contenedor para el mensaje
    const messageWrapper = document.createElement('div');
    messageWrapper.style.width = '100%';
    messageWrapper.style.display = 'inline-block';
    messageWrapper.style.marginBottom = '8px';

    // Crear un mensaje placeholder del bot
    const botMessageElement = document.createElement('div');
    botMessageElement.className = 'message bot-message thinking';
    botMessageElement.textContent = 'Pensando...';
    botMessageElement.style.backgroundColor = '#f1f1f1';
    botMessageElement.style.color = '#666';
    botMessageElement.style.float = 'left';
    botMessageElement.style.clear = 'both';

    // Agregar el mensaje al wrapper
    messageWrapper.appendChild(botMessageElement);

    // Agregarlo al DOM
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.appendChild(messageWrapper);
      this.scrollToBottom();
    }
    
    // Pasar el sessionId actual si existe
    this.chatbotService.sendMessage(userMessage, this.currentSessionId || undefined).subscribe({
      next: (accumulatedText) => {
        // Mostrar en consola el progreso de la respuesta
        console.log(`📩 Recibiendo mensaje para la sesión ${this.currentSessionId || 'nueva'}`);
        
        // Quitar la clase "thinking" al recibir la primera respuesta
        if (botMessageElement.classList.contains("thinking")) {
          botMessageElement.textContent = '';
          botMessageElement.classList.remove("thinking");
          botMessageElement.classList.add("markdown-content");
        }
        
        try {
          // Preprocesar el texto para mejorar la visualización de listas
          const enhancedText = this.enhanceMarkdownText(accumulatedText);
          
          // Actualizar el HTML con el markdown procesado
          const parsedContent = marked.parse(enhancedText);
          
          if (parsedContent instanceof Promise) {
            parsedContent.then(htmlContent => {
              botMessageElement.innerHTML = htmlContent;
              this.scrollToBottom();
            }).catch(error => {
              console.error('Error al procesar Markdown async:', error);
              botMessageElement.textContent = accumulatedText;
            });
          } else {
            botMessageElement.innerHTML = parsedContent;
            this.scrollToBottom();
          }
        } catch (error) {
          console.error('Error al procesar Markdown:', error);
          botMessageElement.textContent = accumulatedText;
        }
      },
      error: (error) => {
        this.isTyping = false;
        console.error('Error enviando mensaje:', error);
        
        if (botMessageElement && botMessageElement.classList.contains('thinking')) {
          botMessageElement.textContent = `Error: ${error.message}`;
          botMessageElement.classList.remove('thinking');
        } else {
          this.addSystemMessage('Error al enviar mensaje. Intente nuevamente.');
        }
      },
      complete: () => {
        this.isTyping = false;
        console.log('Transmisión de respuesta completada');
      }
    });
  }
  
  // Método para mejorar el formato de las respuestas
  enhanceMarkdownText(text: string): string {
    // Procesar el texto para convertir guiones en formato estructurado
    return text
      // 1. Procesar productos con formato especial
      .replace(/- (Horno De Microondas|Microondas) ([^-\n]+)(?:\s*-\s*)/g, '* <span class="product-name">$1 $2</span>\n')
      
      // 2. Procesar los detalles (marca, categoría, precio, etc.)
      .replace(/- Marca:\s*([^-\n]+)(?:\s*-\s*)?/g, '  * <span class="product-detail">Marca: **$1**</span>\n')
      .replace(/- Categoría:\s*([^-\n]+)(?:\s*-\s*)?/g, '  * <span class="product-detail">Categoría: **$1**</span>\n')
      .replace(/- Precio:\s*([^-\n]+)(?:\s*-\s*)?/g, '  * <span class="product-detail">Precio: <span class="price-highlight">$1</span></span>\n')
      .replace(/- \*\*Calificación:\*\*([^-\n]+)(?:\s*-\s*)?/g, '  * <span class="product-detail">**Calificación:**$1</span>\n')
      .replace(/- Calificación:\s*([^-\n]+)(?:\s*-\s*)?/g, '  * <span class="product-detail">Calificación: **$1**</span>\n')
      
      // 3. Asegurarnos que todos los demás guiones se conviertan en viñetas
      .replace(/- ([^\n]+)/g, '* $1\n');
  }

  addMessage(content: string, sender: 'user' | 'bot' | 'system'): void {
    // Crear un contenedor para el mensaje
    const messageWrapper = document.createElement('div');
    messageWrapper.style.width = '100%';
    messageWrapper.style.display = 'inline-block';
    messageWrapper.style.marginBottom = '8px';
    
    // Crear el mensaje real
    const message = document.createElement('div');
    message.className = `message ${sender}-message`;
    
    // Aplicar estilos inline adicionales
    if (sender === 'user') {
      message.style.backgroundColor = '#e8f5e9';
      message.style.color = '#1a237e';
      message.style.float = 'right';
      message.style.clear = 'both';
    } else if (sender === 'bot') {
      message.style.backgroundColor = '#f1f1f1';
      message.style.color = '#333';
      message.style.float = 'left';
      message.style.clear = 'both';
    }
    
    if (sender === 'bot') {
      // Parse markdown para mensajes del bot
      try {
        // Mejorar el formato del markdown
        const enhancedContent = this.enhanceMarkdownText(content);
        const parsedContent = marked.parse(enhancedContent);
        
        if (parsedContent instanceof Promise) {
          message.textContent = content;
          parsedContent.then(htmlContent => {
            message.innerHTML = htmlContent;
            message.classList.add('markdown-content');
            this.scrollToBottom();
          }).catch(error => {
            console.error('Error parsing markdown async:', error);
            message.textContent = content;
          });
        } else {
          message.innerHTML = parsedContent;
          message.classList.add('markdown-content');
        }
      } catch (error) {
        console.error('Error parsing markdown:', error);
        message.textContent = content;
      }
    } else {
      // Los mensajes de usuario permanecen como texto simple
      message.textContent = content;
    }
    
    // Agregar el mensaje al wrapper
    messageWrapper.appendChild(message);
    
    // Agregar al DOM
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.appendChild(messageWrapper);
      this.scrollToBottom();
    }
    
    // Mantener registro en el array de mensajes
    this.messages.push({
      content,
      sender,
      timestamp: new Date(),
      id: `${sender}-${Date.now()}`
    });
  }

  addSystemMessage(content: string): void {
    const messageWrapper = document.createElement('div');
    messageWrapper.style.width = '100%';
    messageWrapper.style.textAlign = 'center';
    messageWrapper.style.marginBottom = '8px';
    
    const message = document.createElement('div');
    message.className = 'message system-message';
    message.textContent = content;
    message.style.backgroundColor = '#fff8e1';
    message.style.color = '#e65100';
    message.style.margin = '0 auto';
    message.style.display = 'inline-block';
    
    messageWrapper.appendChild(message);
    
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.appendChild(messageWrapper);
      this.scrollToBottom();
    }
    
    this.messages.push({
      content,
      sender: 'system',
      timestamp: new Date(),
      id: `system-${Date.now()}`
    });
  }

  // Formatear fecha para mostrarla en el historial
  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return 'Fecha desconocida';
      }
      return date.toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      const messagesContainer = document.getElementById('messagesContainer');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  // Reemplazar el uso de Math.ceil en el template con métodos de clase
  getPageCount(): number {
    return Math.ceil(this.totalSessions/10);
  }

  isNextPageDisabled(): boolean {
    return this.currentPage >= this.getPageCount();
  }

  isPrevPageDisabled(): boolean {
    return this.currentPage <= 1;
  }
}
