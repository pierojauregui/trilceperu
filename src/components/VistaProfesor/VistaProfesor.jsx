import { useState, useEffect } from 'react';
import MisCursos from './MisCursos';
import MisAlumnos from './MisAlumnos';
import AsistenciasProfesor from './AsistenciasProfesor';
import GestionarClases from './GestionarClases';
import ClasesModulo from './ClasesModulo';
import ClasesIndividual from './ClasesIndividual';
import GestionarExamenes from './GestionarExamenes';
import ForosProfesor from './ForosProfesor';
import Reportes from './Reportes';
import './VistaProfesor.css';

const VistaProfesor = ({ currentSection, setCurrentSection }) => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(() => {
    // Inicializar desde localStorage si existe
    return localStorage.getItem('cursoSeleccionado') || null;
  });

  // Actualizar localStorage cuando cambie el curso seleccionado
  useEffect(() => {
    if (cursoSeleccionado) {
      localStorage.setItem('cursoSeleccionado', cursoSeleccionado);
    }
  }, [cursoSeleccionado]);

  const renderProfesorContent = () => {
    switch (currentSection) {
      case 'mis-cursos':
        return (
          <MisCursos
            setCurrentSection={setCurrentSection}
            setCursoSeleccionado={setCursoSeleccionado}
          />
        );

      case 'mis-alumnos':
        if (!cursoSeleccionado) {
          return (
            <div className="no-curso-seleccionado">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso primero</h2>
              <p>Para ver los alumnos, necesitas seleccionar un curso desde "Mis Cursos"</p>
              <button
                className="btn-volver-cursos"
                onClick={() => setCurrentSection('mis-cursos')}
              >
                <i className='bx bx-arrow-back'></i>
                Ir a Mis Cursos
              </button>
            </div>
          );
        }
        return (
          <MisAlumnos
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'asistencias':
        if (!cursoSeleccionado) {
          return (
            <div className="no-curso-seleccionado">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso primero</h2>
              <p>Para gestionar asistencias, necesitas seleccionar un curso desde "Mis Cursos"</p>
              <button
                className="btn-volver-cursos"
                onClick={() => setCurrentSection('mis-cursos')}
              >
                <i className='bx bx-arrow-back'></i>
                Ir a Mis Cursos
              </button>
            </div>
          );
        }
        return (
          <AsistenciasProfesor
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'gestionar-clases':
        if (!cursoSeleccionado && !currentSection.includes('gestionar')) {
          return (
            <div className="no-curso-seleccionado">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso primero</h2>
              <p>Para gestionar clases, necesitas seleccionar un curso desde "Mis Cursos"</p>
              <button
                className="btn-volver-cursos"
                onClick={() => setCurrentSection('mis-cursos')}
              >
                <i className='bx bx-arrow-back'></i>
                Ir a Mis Cursos
              </button>
            </div>
          );
        }
        return (
          <GestionarClases
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'clases-modulo':
        return (
          <ClasesModulo
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'clase-individual':
        return (
          <ClasesIndividual
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'examenes-profesor':
        if (!cursoSeleccionado) {
          return (
            <div className="no-curso-seleccionado">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso primero</h2>
              <p>Para gestionar exámenes, necesitas seleccionar un curso desde "Mis Cursos"</p>
              <button
                className="btn-volver-cursos"
                onClick={() => setCurrentSection('mis-cursos')}
              >
                <i className='bx bx-arrow-back'></i>
                Ir a Mis Cursos
              </button>
            </div>
          );
        }
        return (
          <GestionarExamenes
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'foros-profesor':
        if (!cursoSeleccionado) {
          return (
            <div className="no-curso-seleccionado">
              <i className='bx bx-info-circle'></i>
              <h2>Selecciona un curso primero</h2>
              <p>Para gestionar foros, necesitas seleccionar un curso desde "Mis Cursos"</p>
              <button
                className="btn-volver-cursos"
                onClick={() => setCurrentSection('mis-cursos')}
              >
                <i className='bx bx-arrow-back'></i>
                Ir a Mis Cursos
              </button>
            </div>
          );
        }
        return (
          <ForosProfesor
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      case 'reportes-profesor':
        return (
          <Reportes
            cursoId={cursoSeleccionado}
            setCurrentSection={setCurrentSection}
          />
        );

      default:
        return (
          <MisCursos
            setCurrentSection={setCurrentSection}
            setCursoSeleccionado={setCursoSeleccionado}
          />
        );
    }
  };

  return (
    <div className="vista-profesor">
      {/* Mostrar información del curso seleccionado si existe */}
      {cursoSeleccionado && currentSection !== 'mis-cursos' && currentSection !== 'gestionar-clases' && (
        <div className="curso-seleccionado-info">
          <span>Curso ID: {cursoSeleccionado}</span>
          <button
            className="btn-cambiar-curso"
            onClick={() => {
              setCursoSeleccionado(null);
              setCurrentSection('mis-cursos');
            }}
          >
            <i className='bx bx-refresh'></i>
            Cambiar Curso
          </button>
        </div>
      )}

      {renderProfesorContent()}
    </div>
  );
};

export default VistaProfesor;