import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy el asistente virtual de Trilce Perú 🎓. ¿En qué puedo ayudarte hoy?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Preguntas frecuentes y respuestas
  const faqData = {
    "cursos": {
      keywords: ["cursos", "curso", "clases", "materias", "carreras", "programas"],
      response: "Ofrecemos una amplia variedad de cursos:\n\n📚 **Cursos Académicos:**\n• Matemáticas\n• Comunicación\n• Ciencias\n• Historia\n\n💻 **Cursos Técnicos:**\n• Programación\n• Diseño Gráfico\n• Marketing Digital\n• Inglés\n\n¿Te interesa algún curso en particular?",
      quickReplies: ["Ver todos los cursos", "Precios", "Horarios", "Hablar con asesor"]
    },
    "precios": {
      keywords: ["precio", "costo", "cuanto cuesta", "tarifas", "mensualidad", "pago"],
      response: "💰 **Nuestros precios son muy competitivos:**\n\n• Curso individual: S/. 150 - S/. 300\n• Paquete mensual: S/. 400 - S/. 800\n• Descuentos por pronto pago: 15%\n• Descuentos familiares: 20%\n\n¡Tenemos facilidades de pago y becas disponibles!",
      quickReplies: ["Formas de pago", "Becas disponibles", "Hablar con asesor", "Ver cursos"]
    },
    "horarios": {
      keywords: ["horarios", "horario", "cuando", "tiempo", "duración", "cronograma"],
      response: "⏰ **Horarios flexibles para ti:**\n\n🌅 **Mañana:** 8:00 AM - 12:00 PM\n🌞 **Tarde:** 2:00 PM - 6:00 PM\n🌙 **Noche:** 7:00 PM - 10:00 PM\n💻 **Virtual:** 24/7 disponible\n\n**Duración:** 2-6 meses según el curso",
      quickReplies: ["Modalidad virtual", "Modalidad presencial", "Ver cursos", "Hablar con asesor"]
    },
    "inscripcion": {
      keywords: ["inscribir", "matricula", "registro", "como me inscribo", "requisitos"],
      response: "📝 **¡Inscríbete fácilmente!**\n\n**Requisitos:**\n• DNI vigente\n• Certificado de estudios\n• Foto tamaño carnet\n• Pago de matrícula\n\n**Proceso:**\n1. Elige tu curso\n2. Completa el formulario\n3. Realiza el pago\n4. ¡Listo para estudiar!",
      quickReplies: ["Inscribirme ahora", "Documentos necesarios", "Hablar con asesor", "Ver cursos"]
    },
    "contacto": {
      keywords: ["contacto", "telefono", "direccion", "ubicacion", "donde", "llamar"],
      response: "📞 **Contáctanos:**\n\n**Teléfono:** (01) 123-4567\n**WhatsApp:** +51 987 654 321\n**Email:** info@trilceperu.edu.pe\n\n📍 **Ubicaciones:**\n• Lima Centro: Av. Abancay 123\n• San Juan de Lurigancho: Av. Próceres 456\n• Callao: Av. Argentina 789",
      quickReplies: ["Hablar por WhatsApp", "Ver mapa", "Horarios de atención", "Escribir email"]
    },
    "modalidades": {
      keywords: ["modalidad", "presencial", "virtual", "online", "distancia", "remoto"],
      response: "🎯 **Modalidades disponibles:**\n\n💻 **Virtual:**\n• Clases en vivo\n• Grabaciones disponibles\n• Plataforma interactiva\n• Soporte 24/7\n\n🏫 **Presencial:**\n• Aulas modernas\n• Laboratorios equipados\n• Biblioteca\n• Actividades grupales\n\n🔄 **Híbrida:** Lo mejor de ambas",
      quickReplies: ["Modalidad virtual", "Modalidad presencial", "Ver horarios", "Hablar con asesor"]
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findBestMatch = (userInput) => {
    const input = userInput.toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;

    Object.entries(faqData).forEach(([key, data]) => {
      const matches = data.keywords.filter(keyword => 
        input.includes(keyword.toLowerCase())
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = data;
      }
    });

    return bestMatch;
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text: text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular delay de respuesta
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (userInput) => {
    const match = findBestMatch(userInput);
    
    let responseText;
    let quickReplies = [];

    if (match) {
      responseText = match.response;
      quickReplies = match.quickReplies;
    } else if (userInput.toLowerCase().includes('hola') || userInput.toLowerCase().includes('buenos')) {
      responseText = "¡Hola! 👋 Bienvenido a Trilce Perú. Estoy aquí para ayudarte con información sobre nuestros cursos, precios, horarios y más. ¿Qué te gustaría saber?";
      quickReplies = ["Ver cursos", "Precios", "Horarios", "Contacto"];
    } else if (userInput.toLowerCase().includes('gracias')) {
      responseText = "¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte? Estoy aquí para resolver todas tus dudas sobre Trilce Perú.";
      quickReplies = ["Ver cursos", "Hablar con asesor", "Contacto"];
    } else {
      responseText = "Entiendo tu consulta, pero para brindarte la mejor atención personalizada, te recomiendo hablar directamente con uno de nuestros asesores. ¡Estarán encantados de ayudarte! 😊";
      quickReplies = ["Hablar con asesor", "Ver cursos", "Precios", "Contacto"];
    }

    return {
      id: Date.now(),
      text: responseText,
      isBot: true,
      timestamp: new Date(),
      quickReplies: quickReplies
    };
  };

  const handleQuickReply = (reply) => {
    if (reply === "Hablar con asesor" || reply === "Hablar por WhatsApp") {
      const whatsappNumber = "51987654321";
      const message = "¡Hola! Vengo del chatbot de la web y me gustaría hablar con un asesor sobre los cursos de Trilce Perú.";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }
    
    handleSendMessage(reply);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {/* Botón flotante del chatbot */}
      <div 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
        
        {/* Indicador de notificación - Solo mostrar cuando el chat está cerrado */}
        {!isOpen && <div className="chatbot-notification"></div>}
      </div>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header del chat */}
          <div className="chatbot-header">
            <div className="chatbot-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V19H13V21H11V23H19C20.11 23 21 22.11 21 21V9M20 8H16V4L20 8ZM7 9H13V11H7V9ZM7 13H13V15H7V13Z"/>
              </svg>
            </div>
            <div className="chatbot-info">
              <h4>Asistente Trilce</h4>
              <span className="status">En línea</span>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  {message.quickReplies && (
                    <div className="quick-replies">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          className="quick-reply-btn"
                          onClick={() => handleQuickReply(reply)}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="bot-typing-container">
                  <img 
                    src="/images/bot-avatar.svg" 
                    alt="Bot pensando" 
                    className="bot-typing-avatar"
                  />
                  <span className="bot-typing-text">El bot está escribiendo...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input del chat */}
          <div className="chatbot-input">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu pregunta..."
              disabled={isTyping}
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="send-btn"
              title="Enviar mensaje"
            >
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;