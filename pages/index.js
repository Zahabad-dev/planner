import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const CONTENT_TYPES = ['reels', 'post', 'historias', 'carrusel', 'tiktok'];
// Sin límite de proyectos - puedes tener tantos como necesites por día

export default function Home() {
  const [activeTab, setActiveTab] = useState('reels');
  const [selectedClient, setSelectedClient] = useState('todos');
  const [selectedMonth, setSelectedMonth] = useState('todos');
  
  // Vista unificada de todos los tipos para un cliente
  const [showUnifiedView, setShowUnifiedView] = useState(false);
  
  // Cliente seleccionado para agregar nuevo proyecto
  const [clientForNewProject, setClientForNewProject] = useState('');
  
  // Control de días expandidos/colapsados (por defecto todos colapsados)
  const [expandedDays, setExpandedDays] = useState({});
  
  // Control de menú de exportación
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Mes de trabajo activo (formato: YYYY-MM)
  const [workingMonth, setWorkingMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Gestión de clientes
  const [clients, setClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  
  const [projects, setProjects] = useState({
    reels: [],
    post: [],
    historias: [],
    carrusel: [],
    tiktok: []
  });

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('contentPlanner');
    if (savedData) {
      try {
        setProjects(JSON.parse(savedData));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    }

    const savedClients = localStorage.getItem('contentPlannerClients');
    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    }

    const savedWorkingMonth = localStorage.getItem('contentPlannerWorkingMonth');
    if (savedWorkingMonth) {
      setWorkingMonth(savedWorkingMonth);
    }
  }, []);

  // Guardar automáticamente en localStorage cuando cambian los proyectos
  useEffect(() => {
    localStorage.setItem('contentPlanner', JSON.stringify(projects));
  }, [projects]);

  // Guardar clientes en localStorage
  useEffect(() => {
    localStorage.setItem('contentPlannerClients', JSON.stringify(clients));
  }, [clients]);

  // Guardar mes de trabajo en localStorage
  useEffect(() => {
    localStorage.setItem('contentPlannerWorkingMonth', workingMonth);
  }, [workingMonth]);

  const addProject = (type) => {
    // Validar que haya un cliente seleccionado
    if (!clientForNewProject) {
      alert('Por favor selecciona un cliente primero');
      return;
    }

    const newProject = {
      id: Date.now(),
      nombre: '',
      cliente: clientForNewProject, // Asignar automáticamente el cliente seleccionado
      fechaEntrega: `${workingMonth}-01`, // Pre-llenar con el primer día del mes de trabajo
      desarrollo: '',
      elementos: '',
      guion: '',
      duracion: '',
      referencias: ''
    };

    setProjects(prev => ({
      ...prev,
      [type]: [...prev[type], newProject]
    }));
  };

  const updateProject = (type, projectId, field, value) => {
    setProjects(prev => ({
      ...prev,
      [type]: prev[type].map(project =>
        project.id === projectId
          ? { ...project, [field]: value }
          : project
      )
    }));
  };

  const deleteProject = (type, projectId) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      setProjects(prev => ({
        ...prev,
        [type]: prev[type].filter(project => project.id !== projectId)
      }));
    }
  };

  // Obtener lista única de clientes de todos los proyectos
  const allClients = useMemo(() => {
    const clientSet = new Set();
    Object.values(projects).flat().forEach(project => {
      if (project.cliente && project.cliente.trim()) {
        clientSet.add(project.cliente.trim());
      }
    });
    return Array.from(clientSet).sort();
  }, [projects]);

  // Gestión de clientes
  const addClient = () => {
    const trimmedName = newClientName.trim();
    if (!trimmedName) {
      alert('Por favor ingresa un nombre de cliente');
      return;
    }
    if (clients.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Este cliente ya existe');
      return;
    }
    setClients(prev => [...prev, { id: Date.now(), name: trimmedName }]);
    setNewClientName('');
  };

  const deleteClient = (clientId) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
    }
  };

  // Navegación de mes
  const changeMonth = (direction) => {
    const [year, month] = workingMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + direction);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setWorkingMonth(newMonth);
    setSelectedMonth('todos'); // Reset filtro de mes
  };

  // Obtener lista única de meses de todos los proyectos
  const allMonths = useMemo(() => {
    const monthSet = new Set();
    Object.values(projects).flat().forEach(project => {
      if (project.fechaEntrega) {
        const date = new Date(project.fechaEntrega + 'T00:00:00');
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(monthYear);
      }
    });
    return Array.from(monthSet).sort();
  }, [projects]);

  // Filtrar proyectos según cliente y mes seleccionados
  const filteredProjects = useMemo(() => {
    let filtered = projects[activeTab];

    // Solo filtrar por mes de trabajo si el filtro de mes específico no está activo
    // Y solo si hay un filtro de cliente activo o si queremos ver solo el mes actual
    if (selectedMonth === 'todos') {
      // Si no hay filtro de cliente, mostrar TODOS los proyectos
      if (selectedClient === 'todos') {
        // No aplicar ningún filtro, mostrar todos los proyectos
        return filtered;
      } else {
        // Solo filtrar por cliente
        filtered = filtered.filter(project => 
          project.cliente && project.cliente.trim() === selectedClient
        );
      }
    } else {
      // Hay un filtro de mes específico
      filtered = filtered.filter(project => {
        if (!project.fechaEntrega) return false;
        const date = new Date(project.fechaEntrega + 'T00:00:00');
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthYear === selectedMonth;
      });

      if (selectedClient !== 'todos') {
        filtered = filtered.filter(project => 
          project.cliente && project.cliente.trim() === selectedClient
        );
      }
    }

    return filtered;
  }, [projects, activeTab, selectedClient, selectedMonth]);

  // Obtener TODOS los proyectos de un cliente (todas las categorías)
  const getAllClientProjects = useMemo(() => {
    if (selectedClient === 'todos') return [];
    
    let allProjects = [];
    CONTENT_TYPES.forEach(type => {
      const typeProjects = projects[type]
        .filter(project => project.cliente && project.cliente.trim() === selectedClient)
        .map(project => ({ ...project, type })); // Agregar el tipo al proyecto
      allProjects = [...allProjects, ...typeProjects];
    });

    // Filtrar por mes si es necesario
    if (selectedMonth !== 'todos') {
      allProjects = allProjects.filter(project => {
        if (!project.fechaEntrega) return false;
        const date = new Date(project.fechaEntrega + 'T00:00:00'); // Agregar tiempo para evitar problemas de zona horaria
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        console.log('Comparando:', monthYear, 'con', selectedMonth, 'fecha original:', project.fechaEntrega);
        return monthYear === selectedMonth;
      });
    }

    // Ordenar por fecha de entrega
    return allProjects.sort((a, b) => {
      if (!a.fechaEntrega) return 1;
      if (!b.fechaEntrega) return -1;
      return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
    });
  }, [projects, selectedClient, selectedMonth]);

  // Formatear mes para mostrar
  const formatMonth = (monthYear) => {
    if (monthYear === 'todos') return 'Todos los meses';
    const [year, month] = monthYear.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Contar proyectos por cliente en la pestaña activa
  const getClientProjectCount = (clientName) => {
    if (!clientName) return 0;
    return projects[activeTab].filter(p => p.cliente === clientName).length;
  };

  // Contar TODOS los proyectos de un cliente (todas las categorías)
  const getTotalClientProjects = (clientName) => {
    if (!clientName) return 0;
    let total = 0;
    CONTENT_TYPES.forEach(type => {
      total += projects[type].filter(p => p.cliente === clientName).length;
    });
    return total;
  };

  // Obtener emoji por tipo de contenido
  const getContentTypeEmoji = (type) => {
    const emojis = {
      reels: '🎬',
      post: '📸',
      historias: '📖',
      carrusel: '🎠',
      tiktok: '🎵'
    };
    return emojis[type] || '📄';
  };

  // Formatear fecha completa
  const formatFullDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Agrupar proyectos por día
  const groupProjectsByDay = (projectsList) => {
    const grouped = {};
    projectsList.forEach(project => {
      const day = project.fechaEntrega || 'sin-fecha';
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(project);
    });
    return grouped;
  };

  // Toggle expandir/colapsar día
  const toggleDay = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Expandir todos los días
  const expandAllDays = () => {
    const allDays = Object.keys(groupProjectsByDay(getAllClientProjects));
    const expanded = {};
    allDays.forEach(day => expanded[day] = true);
    setExpandedDays(expanded);
  };

  // Colapsar todos los días
  const collapseAllDays = () => {
    setExpandedDays({});
  };

  // Funciones de exportación
  const handleExport = (format, period) => {
    if (selectedClient === 'todos') {
      alert('Por favor selecciona un cliente primero');
      return;
    }
    
    const referenceDate = workingMonth + '-01'; // Usar el primer día del mes de trabajo como referencia
    
    if (format === 'excel') {
      exportToExcel(getAllClientProjects, period, referenceDate, selectedClient);
    } else if (format === 'pdf') {
      exportToPDF(getAllClientProjects, period, referenceDate, selectedClient);
    }
    
    setShowExportMenu(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Content Planner - Organizador de Ideas</title>
        <meta name="description" content="Planificador creativo de contenido multimedia" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          📱 Content Planner
        </h1>
        <p className={styles.subtitle}>
          Organiza tus ideas de contenido creativo
        </p>

        {/* Selector de mes de trabajo */}
        <div className={styles.monthSelector}>
          <button 
            className={styles.monthNav}
            onClick={() => changeMonth(-1)}
            title="Mes anterior"
          >
            ◀
          </button>
          <div className={styles.monthDisplay}>
            <span className={styles.monthLabel}>📅 Mes de trabajo:</span>
            <span className={styles.monthValue}>{formatMonth(workingMonth)}</span>
          </div>
          <button 
            className={styles.monthNav}
            onClick={() => changeMonth(1)}
            title="Mes siguiente"
          >
            ▶
          </button>
          <button 
            className={styles.clientsButton}
            onClick={() => setShowClientModal(true)}
          >
            👥 Gestionar Clientes ({clients.length})
          </button>
        </div>

        {/* Barra de pestañas */}
        <div className={styles.tabs}>
          {CONTENT_TYPES.map(type => (
            <button
              key={type}
              className={`${styles.tab} ${activeTab === type ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className={styles.badge}>{projects[type].length}</span>
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div className={styles.tabContent}>
          <div className={styles.header}>
            <h2 className={styles.sectionTitle}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            
            <div className={styles.addProjectSection}>
              <div className={styles.clientSelector}>
                <label htmlFor="newProjectClient">Cliente para nuevo proyecto:</label>
                <select
                  id="newProjectClient"
                  value={clientForNewProject}
                  onChange={(e) => setClientForNewProject(e.target.value)}
                  className={styles.clientSelectForNew}
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.name}>
                      {client.name} ({getClientProjectCount(client.name)} en {activeTab})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className={styles.addButton}
                onClick={() => addProject(activeTab)}
                disabled={!clientForNewProject}
              >
                + Añadir Proyecto
              </button>
            </div>
          </div>

          {/* Filtros por cliente y mes */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="clientFilter">👤 Filtrar por Cliente:</label>
              <select 
                id="clientFilter"
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  // Activar vista unificada automáticamente si se selecciona un cliente
                  if (e.target.value !== 'todos') {
                    setShowUnifiedView(true);
                    // Resetear filtro de mes a "todos" para mostrar todos los proyectos del cliente
                    setSelectedMonth('todos');
                  } else {
                    setShowUnifiedView(false);
                  }
                }}
                className={styles.filterSelect}
              >
                <option value="todos">Todos los clientes</option>
                {allClients.map(client => (
                  <option key={client} value={client}>
                    {client} ({getTotalClientProjects(client)} proyectos totales)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="monthFilter">📅 Filtrar por Mes:</label>
              <select 
                id="monthFilter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos los meses</option>
                <option value={workingMonth}>📌 {formatMonth(workingMonth)} (Mes actual)</option>
                {allMonths.filter(m => m !== workingMonth).map(month => (
                  <option key={month} value={month}>{formatMonth(month)}</option>
                ))}
              </select>
            </div>

            {selectedClient !== 'todos' && (
              <div className={styles.filterGroup}>
                <label htmlFor="viewToggle">👁️ Vista:</label>
                <button
                  className={`${styles.viewToggle} ${showUnifiedView ? styles.viewToggleActive : ''}`}
                  onClick={() => setShowUnifiedView(!showUnifiedView)}
                >
                  {showUnifiedView ? '📋 Vista Unificada' : '📂 Por Categorías'}
                </button>
              </div>
            )}

            {(selectedClient !== 'todos' || selectedMonth !== 'todos') && (
              <button 
                className={styles.clearFilters}
                onClick={() => {
                  setSelectedClient('todos');
                  setSelectedMonth('todos');
                  setShowUnifiedView(false);
                }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {/* Información de filtros activos */}
          {(selectedClient !== 'todos' || selectedMonth !== 'todos') ? (
            <div className={styles.filterInfo}>
              Mostrando {showUnifiedView ? getAllClientProjects.length : filteredProjects.length} de {projects[activeTab].length} proyectos
              {selectedClient !== 'todos' && ` • Cliente: ${selectedClient}`}
              {selectedMonth !== 'todos' && ` • Mes: ${formatMonth(selectedMonth)}`}
              {showUnifiedView && ' • Vista: Todos los tipos de contenido'}
            </div>
          ) : (
            <div className={styles.filterInfoAll}>
              📋 Mostrando todos los proyectos ({filteredProjects.length})
            </div>
          )}

          {/* Vista unificada o vista por categoría */}
          {showUnifiedView && selectedClient !== 'todos' ? (
            // Vista unificada: Todos los proyectos del cliente agrupados por día
            getAllClientProjects.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay proyectos para este cliente</p>
                <p className={styles.emptyHint}>Cambia los filtros o agrega nuevos proyectos</p>
              </div>
            ) : (
              <>
                <div className={styles.accordionControls}>
                  <button onClick={expandAllDays} className={styles.controlButton}>
                    ⬇️ Expandir Todos
                  </button>
                  <button onClick={collapseAllDays} className={styles.controlButton}>
                    ⬆️ Colapsar Todos
                  </button>
                  <div className={styles.exportButtonContainer}>
                    <button 
                      onClick={() => setShowExportMenu(!showExportMenu)} 
                      className={styles.exportButton}
                    >
                      📥 Exportar
                    </button>
                    
                    {showExportMenu && (
                      <div className={styles.exportMenu}>
                        <div className={styles.exportMenuHeader}>Exportar como:</div>
                        
                        <div className={styles.exportSection}>
                          <div className={styles.exportSectionTitle}>📊 Excel</div>
                          <button onClick={() => handleExport('excel', 'dia')} className={styles.exportOption}>
                            📅 Día
                          </button>
                          <button onClick={() => handleExport('excel', 'semana')} className={styles.exportOption}>
                            📆 Semana
                          </button>
                          <button onClick={() => handleExport('excel', 'quincena')} className={styles.exportOption}>
                            🗓️ Quincena
                          </button>
                          <button onClick={() => handleExport('excel', 'mes')} className={styles.exportOption}>
                            📋 Mes
                          </button>
                        </div>
                        
                        <div className={styles.exportSection}>
                          <div className={styles.exportSectionTitle}>📄 PDF</div>
                          <button onClick={() => handleExport('pdf', 'dia')} className={styles.exportOption}>
                            📅 Día
                          </button>
                          <button onClick={() => handleExport('pdf', 'semana')} className={styles.exportOption}>
                            📆 Semana
                          </button>
                          <button onClick={() => handleExport('pdf', 'quincena')} className={styles.exportOption}>
                            🗓️ Quincena
                          </button>
                          <button onClick={() => handleExport('pdf', 'mes')} className={styles.exportOption}>
                            📋 Mes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.timelineView}>
                  {Object.entries(groupProjectsByDay(getAllClientProjects)).map(([day, dayProjects]) => (
                    <div key={day} className={styles.daySection}>
                      <div 
                        className={styles.dayHeader}
                        onClick={() => toggleDay(day)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.dayHeaderContent}>
                          <span className={styles.expandIcon}>
                            {expandedDays[day] ? '▼' : '▶'}
                          </span>
                          <span className={styles.dayDate}>📅 {formatFullDate(day)}</span>
                        </div>
                        <span className={styles.dayCount}>{dayProjects.length} proyecto{dayProjects.length !== 1 ? 's' : ''}</span>
                      </div>
                      
                      {expandedDays[day] && (
                        <div className={styles.projectsGrid}>
                          {dayProjects.map(project => (
                  <div key={`${project.type}-${project.id}`} className={styles.projectCard}>
                    <div className={styles.contentTypeBadge}>
                      {getContentTypeEmoji(project.type)} {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                    </div>
                    
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteProject(project.type, project.id)}
                      title="Eliminar proyecto"
                    >
                      ×
                    </button>

                    <div className={styles.formGroup}>
                      <label>Nombre del Proyecto</label>
                      <input
                        type="text"
                        placeholder="Ej: Video promocional"
                        value={project.nombre}
                        onChange={(e) => updateProject(project.type, project.id, 'nombre', e.target.value)}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Cliente</label>
                        <select
                          value={project.cliente}
                          onChange={(e) => updateProject(project.type, project.id, 'cliente', e.target.value)}
                        >
                          <option value="">Selecciona un cliente</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.name}>{client.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Fecha de Entrega</label>
                        <input
                          type="date"
                          value={project.fechaEntrega}
                          onChange={(e) => updateProject(project.type, project.id, 'fechaEntrega', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Desarrollo</label>
                      <textarea
                        placeholder="Describe el desarrollo del proyecto..."
                        rows="3"
                        value={project.desarrollo}
                        onChange={(e) => updateProject(project.type, project.id, 'desarrollo', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Elementos</label>
                      <textarea
                        placeholder="Lista los elementos necesarios..."
                        rows="2"
                        value={project.elementos}
                        onChange={(e) => updateProject(project.type, project.id, 'elementos', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Guion</label>
                      <textarea
                        placeholder="Escribe el guion o storyline..."
                        rows="4"
                        value={project.guion}
                        onChange={(e) => updateProject(project.type, project.id, 'guion', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tiempo de Duración</label>
                      <input
                        type="text"
                        placeholder="Ej: 30 segundos, 1 minuto"
                        value={project.duracion}
                        onChange={(e) => updateProject(project.type, project.id, 'duracion', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Referencias</label>
                      <textarea
                        placeholder="URLs, ideas, inspiración..."
                        rows="2"
                        value={project.referencias}
                        onChange={(e) => updateProject(project.type, project.id, 'referencias', e.target.value)}
                      />
                    </div>
                  </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )
          ) : (
            // Vista normal por categoría
            filteredProjects.length === 0 ? (
              <div className={styles.emptyState}>
                {projects[activeTab].length === 0 ? (
                  <>
                    <p>No hay proyectos aún</p>
                    <p className={styles.emptyHint}>Haz clic en &quot;Añadir Proyecto&quot; para comenzar</p>
                  </>
                ) : (
                  <>
                    <p>No hay proyectos que coincidan con los filtros</p>
                    <p className={styles.emptyHint}>Intenta cambiar los filtros o agregar nuevos proyectos</p>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.projectsGrid}>
                {filteredProjects.map(project => (
                <div key={project.id} className={styles.projectCard}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteProject(activeTab, project.id)}
                    title="Eliminar proyecto"
                  >
                    ×
                  </button>

                  <div className={styles.formGroup}>
                    <label>Nombre del Proyecto</label>
                    <input
                      type="text"
                      placeholder="Ej: Video promocional"
                      value={project.nombre}
                      onChange={(e) => updateProject(activeTab, project.id, 'nombre', e.target.value)}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Cliente</label>
                      <select
                        value={project.cliente}
                        onChange={(e) => updateProject(activeTab, project.id, 'cliente', e.target.value)}
                      >
                        <option value="">Selecciona un cliente</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.name}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Fecha de Entrega</label>
                      <input
                        type="date"
                        value={project.fechaEntrega}
                        onChange={(e) => updateProject(activeTab, project.id, 'fechaEntrega', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Desarrollo</label>
                    <textarea
                      placeholder="Describe el desarrollo del proyecto..."
                      rows="3"
                      value={project.desarrollo}
                      onChange={(e) => updateProject(activeTab, project.id, 'desarrollo', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Elementos</label>
                    <textarea
                      placeholder="Lista los elementos necesarios..."
                      rows="2"
                      value={project.elementos}
                      onChange={(e) => updateProject(activeTab, project.id, 'elementos', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Guion</label>
                    <textarea
                      placeholder="Escribe el guion o storyline..."
                      rows="4"
                      value={project.guion}
                      onChange={(e) => updateProject(activeTab, project.id, 'guion', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tiempo de Duración</label>
                    <input
                      type="text"
                      placeholder="Ej: 30 segundos, 1 minuto"
                      value={project.duracion}
                      onChange={(e) => updateProject(activeTab, project.id, 'duracion', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Referencias</label>
                    <textarea
                      placeholder="URLs, ideas, inspiración..."
                      rows="2"
                      value={project.referencias}
                      onChange={(e) => updateProject(activeTab, project.id, 'referencias', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            )
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Content Planner © 2025 - Organiza tus ideas creativas</p>
      </footer>

      {/* Modal de gestión de clientes */}
      {showClientModal && (
        <div className={styles.modal} onClick={() => setShowClientModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>👥 Gestión de Clientes</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowClientModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.addClientForm}>
                <input
                  type="text"
                  placeholder="Nombre del nuevo cliente..."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addClient()}
                  className={styles.clientInput}
                />
                <button 
                  className={styles.addClientButton}
                  onClick={addClient}
                >
                  + Agregar
                </button>
              </div>

              <div className={styles.clientsList}>
                {clients.length === 0 ? (
                  <p className={styles.noClients}>
                    No hay clientes registrados. Agrega tu primer cliente arriba.
                  </p>
                ) : (
                  clients.map(client => (
                    <div key={client.id} className={styles.clientItem}>
                      <span className={styles.clientName}>{client.name}</span>
                      <button
                        className={styles.deleteClientButton}
                        onClick={() => deleteClient(client.id)}
                        title="Eliminar cliente"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
