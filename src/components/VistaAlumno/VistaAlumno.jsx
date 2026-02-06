import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Agregar esta importación
import CursosDisponibles from './CursosDisponibles';
import MisCursosAlumno from './MisCursosAlumno';
import ClasesAlumno from './ClasesAlumno';
import ClasesModuloAlumno from './ClasesModuloAlumno';
import ClaseIndividualAlumno from './ClaseIndividualAlumno';
import ExamenesAlumno from './ExamenesAlumno';
import MisExamenes from './MisExamenes';
import MisAsistencias from './MisAsistencias';
import MisCalificaciones from './MisCalificaciones';
import ForosAlumno from './ForosAlumno';
import DetalleCurso from './compra/DetalleCurso';
import FormularioCompra from './compra/FormularioCompra';
import MisReportes from './MisReportes';
import HomeAlumno from '../home/HomeAlumno';

import './VistaAlumno.css';

const VistaAlumno = ({ currentSection, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth(); // Obtener usuario del contexto
  const [cursoSeleccionado, setCursoSeleccionado] = useState(() => {
    try {
      const stored = localStorage.getItem('cursoSeleccionadoAlumno');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        try {
          const parsed = JSON.parse(stored);
          // Verificar que el objeto parseado tenga propiedades válidas
          if (parsed && (parsed.id || parsed.id_curso)) {
            return parsed;
          }
        } catch {
          // Si no se puede parsear como JSON, intentar como número
          const numericValue = parseInt(stored);
          if (!isNaN(numericValue) && numericValue > 0) {
            return numericValue;
          }
        }
      }
      // Si llegamos aquí, limpiar localStorage
      localStorage.removeItem('cursoSeleccionadoAlumno');
      return null;
    } catch (error) {
      console.error('Error parsing stored curso:', error);
      localStorage.removeItem('cursoSeleccionadoAlumno');
      return null;
    }
  });

  const [cursosValidos, setCursosValidos] = useState([]);

  // Cargar cursos válidos del alumno al montar
  useEffect(() => {
    if (user?.id) {
      cargarCursosValidos();
    }
  }, [user?.id]);

  // Función para cargar cursos válidos del alumno
  const cargarCursosValidos = async () => {
    try {
      const response = await fetch(`${API_URL}/inscripciones/alumno/${user.id}/cursos`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setCursosValidos(data.data);
        
        // Validar si el curso seleccionado en localStorage es válido
        if (cursoSeleccionado) {
          const cursoId = typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id_curso : cursoSeleccionado;
          
          // Verificar que cursoId no sea undefined o null
          if (cursoId === undefined || cursoId === null || cursoId === 'undefined') {
            console.warn(`Curso ${cursoId} en localStorage no es válido. Limpiando...`);
            setCursoSeleccionado(null);
            localStorage.removeItem('cursoSeleccionadoAlumno');
            return;
          }
          
          const cursoValido = data.data.find(c => c.id_curso === parseInt(cursoId));
          
          if (!cursoValido) {
            console.warn(`Curso ${cursoId} en localStorage no es válido. Limpiando...`);
            setCursoSeleccionado(null);
            localStorage.removeItem('cursoSeleccionadoAlumno');
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar cursos válidos:', error);
    }
  };

  // Guardar curso seleccionado en localStorage
  useEffect(() => {
    if (cursoSeleccionado) {
      // Verificar que el curso no sea undefined o null antes de guardarlo
      if (cursoSeleccionado === undefined || cursoSeleccionado === null) {
        console.warn('Intentando guardar curso undefined/null en localStorage. Omitiendo...');
        return;
      }
      
      if (typeof cursoSeleccionado === 'number') {
        localStorage.setItem('cursoSeleccionadoAlumno', cursoSeleccionado.toString());
      } else if (typeof cursoSeleccionado === 'object' && cursoSeleccionado.id) {
        localStorage.setItem('cursoSeleccionadoAlumno', JSON.stringify(cursoSeleccionado));
      } else {
        console.warn('Curso seleccionado tiene formato inválido:', cursoSeleccionado);
      }
    } else {
      localStorage.removeItem('cursoSeleccionadoAlumno');
    }
  }, [cursoSeleccionado]);

  // Función para actualizar el curso seleccionado desde localStorage
  const actualizarCursoDesdeStorage = () => {
    try {
      const stored = localStorage.getItem('cursoSeleccionadoAlumno');
      if (stored && !cursoSeleccionado) {
        try {
          const parsedCurso = JSON.parse(stored);
          setCursoSeleccionado(parsedCurso);
        } catch {
          const numericCurso = parseInt(stored);
          if (!isNaN(numericCurso)) {
            setCursoSeleccionado(numericCurso);
          }
        }
      }
    } catch (error) {
      console.error('Error al actualizar curso desde storage:', error);
    }
  };

  // Verificar localStorage cuando cambie la sección
  useEffect(() => {
    if (currentSection === 'examenes-curso' && !cursoSeleccionado) {
      actualizarCursoDesdeStorage();
    }
  }, [currentSection, cursoSeleccionado]);

  const renderAlumnoContent = () => {
    switch (currentSection) {
      case 'home':
        return <HomeAlumno />;

      case 'cursos-disponibles':
        return (
          <CursosDisponibles
            setCurrentSection={setCurrentSection}
            setCursoSeleccionado={setCursoSeleccionado}
          />
        );

      case 'detalle-curso':
        return (
          <DetalleCurso
            curso={cursoSeleccionado}
            onVolver={() => setCurrentSection('cursos-disponibles')}
            onComprar={() => setCurrentSection('formulario-compra')}
          />
        );

      case 'formulario-compra':
        return (
          <FormularioCompra
            curso={cursoSeleccionado}
            onVolver={() => setCurrentSection('detalle-curso')}
            onCompraExitosa={(curso) => {
              console.log('Compra exitosa para el curso:', curso);
              setCurrentSection('mis-cursos-alumno');
            }}
          />
        );

      case 'mis-cursos-alumno':
        return (
          <MisCursosAlumno
            setCurrentSection={setCurrentSection}
            setCursoSeleccionado={setCursoSeleccionado}
          />
        );

      case 'clases-alumno':
        if (!cursoSeleccionado) {
          return (
            <div className="alumno-no-curso">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso</h2>
              <p>Primero debes seleccionar un curso para ver las clases</p>
              <button onClick={() => setCurrentSection('mis-cursos-alumno')}>
                Ver mis cursos
              </button>
            </div>
          );
        }
        return (
          <ClasesAlumno
            cursoId={typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id : cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'clases-modulo-alumno':
        if (!cursoSeleccionado) {
          return (
            <div className="alumno-no-curso">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso</h2>
              <p>Primero debes seleccionar un curso para ver los módulos</p>
              <button onClick={() => setCurrentSection('mis-cursos-alumno')}>
                Ver mis cursos
              </button>
            </div>
          );
        }
        return (
          <ClasesModuloAlumno
            cursoId={typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id : cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'clase-individual-alumno':
        if (!cursoSeleccionado) {
          return (
            <div className="alumno-no-curso">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso</h2>
              <p>Primero debes seleccionar un curso para ver la clase</p>
              <button onClick={() => setCurrentSection('mis-cursos-alumno')}>
                Ver mis cursos
              </button>
            </div>
          );
        }
        return (
          <ClaseIndividualAlumno
            cursoId={typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id : cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'examenes-alumno':
        return (
          <MisExamenes
            setCurrentSection={setCurrentSection}
          />
        );

      case 'examenes-curso':
        if (!cursoSeleccionado) {
          return (
            <div className="alumno-no-curso">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso</h2>
              <p>Primero debes seleccionar un curso para ver los exámenes</p>
              <button onClick={() => setCurrentSection('examenes-alumno')}>
                Ver mis exámenes
              </button>
            </div>
          );
        }
        return (
          <ExamenesAlumno
            cursoId={typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id_asignacion : cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'mis-asistencias':
        return (
          <MisAsistencias
            setCurrentSection={setCurrentSection}
          />
        );

      case 'foros-alumno':
        // OPCIÓN A: No pasar cursoId (MÁS SIMPLE)
        return (
          <ForosAlumno
            setCurrentSection={setCurrentSection}
          />
        );
        
        /* OPCIÓN B: Pasar cursoId solo si es válido
        const cursoIdParaForos = cursoSeleccionado 
          ? (typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id_curso : cursoSeleccionado)
          : null;
        
        // Validar que sea un curso en el que el alumno está inscrito
        const cursoEsValido = cursosValidos.some(c => c.id_curso === parseInt(cursoIdParaForos));
        
        return (
          <ForosAlumno
            cursoId={cursoEsValido ? cursoIdParaForos : null}
            setCurrentSection={setCurrentSection}
          />
        );
        */

      case 'mis-calificaciones':
        // MisCalificaciones tiene su propio selector de cursos interno
        // No necesita cursoSeleccionado obligatorio
        return (
          <MisCalificaciones
            cursoId={cursoSeleccionado ? (typeof cursoSeleccionado === 'object' ? cursoSeleccionado.id_curso : cursoSeleccionado) : null}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'mis-reportes':
        return (
          <MisReportes
            setCurrentSection={setCurrentSection}
          />
        );

      default:
        return <HomeAlumno />;
    }
  };

  return (
    <div className="vista-alumno">
      {renderAlumnoContent()}
    </div>
  );
};

export default VistaAlumno;