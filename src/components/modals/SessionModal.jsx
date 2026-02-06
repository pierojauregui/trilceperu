import { useEffect } from 'react';
import Swal from 'sweetalert2';

const SessionModal = () => {

    useEffect(() => {
        // Escuchar evento de advertencia de sesión (2 minutos antes de expirar)
        const handleSessionWarning = () => {
            Swal.fire({
                title: '⚠️ Advertencia de Sesión',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 60px; margin-bottom: 15px;">⏰</div>
                        <p style="font-size: 16px; color: #666;">
                            Tu sesión expirará en <strong>2 minutos</strong> por inactividad.<br>
                            ¿Deseas continuar?
                        </p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '✅ Continuar Sesión',
                cancelButtonText: '🚪 Ir al Login',
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#6c757d',
                background: '#16213e',
                color: '#fff',
                customClass: {
                    popup: 'session-swal-popup',
                    title: 'session-swal-title',
                    confirmButton: 'session-swal-confirm',
                    cancelButton: 'session-swal-cancel'
                },
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // Simular actividad del usuario para resetear el timer
                    const event = new Event('mousedown');
                    document.dispatchEvent(event);
                } else {
                    window.location.href = '/login';
                }
            });
        };

        // Escuchar evento de sesión expirada por inactividad
        const handleSessionExpiredByInactivity = () => {
            Swal.fire({
                title: '🔒 Sesión Cerrada',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 60px; margin-bottom: 15px;">🔐</div>
                        <p style="font-size: 16px; color: #b8c5d6;">
                            Tu sesión se ha cerrado por <strong>inactividad</strong> (30 minutos).<br>
                            Por favor, inicia sesión nuevamente.
                        </p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: '🔑 Ir al Login',
                confirmButtonColor: '#667eea',
                background: '#16213e',
                color: '#fff',
                customClass: {
                    popup: 'session-swal-popup',
                    title: 'session-swal-title'
                },
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                window.location.href = '/login';
            });
        };

        // Escuchar evento de sesión expirada por token
        const handleSessionExpiredByToken = () => {
            Swal.fire({
                title: '🔒 Sesión Expirada',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 60px; margin-bottom: 15px;">⏱️</div>
                        <p style="font-size: 16px; color: #b8c5d6;">
                            Tu sesión ha <strong>expirado</strong>.<br>
                            Por favor, inicia sesión nuevamente.
                        </p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: '🔑 Ir al Login',
                confirmButtonColor: '#667eea',
                background: '#16213e',
                color: '#fff',
                customClass: {
                    popup: 'session-swal-popup',
                    title: 'session-swal-title'
                },
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                window.location.href = '/login';
            });
        };

        // Agregar event listeners
        window.addEventListener('sessionWarning', handleSessionWarning);
        window.addEventListener('sessionExpiredByInactivity', handleSessionExpiredByInactivity);
        window.addEventListener('sessionExpiredByToken', handleSessionExpiredByToken);

        // Cleanup
        return () => {
            window.removeEventListener('sessionWarning', handleSessionWarning);
            window.removeEventListener('sessionExpiredByInactivity', handleSessionExpiredByInactivity);
            window.removeEventListener('sessionExpiredByToken', handleSessionExpiredByToken);
        };
    }, []);

    // Este componente no renderiza nada, solo escucha eventos
    return null;
};

export default SessionModal;